'use strict';

import React from 'react';
import If from './If';
import timeago from 'timeago';
import {connectToStores} from 'fluxible-addons-react';
import ApplicationStore from '../stores/ApplicationStore';
import updateShowDockunitSetup from '../actions/updateShowDockunitSetup';

@connectToStores(['UserStore', 'ProjectsStore'], (context, props) => ({
    ApplicationStore: context.getStore(ApplicationStore).getState()
}))
class LatestBuildListItem extends React.Component {
	constructor(props, context) {
        super(props, context);

        this.toggleBuildDetails = this.toggleBuildDetails.bind(this);
        this.rerun = this.rerun.bind(this);
        this.toggleShowDockunitSetup = this.toggleShowDockunitSetup.bind(this);
    }

    static contextTypes = {
        getStore: React.PropTypes.func,
        executeAction: React.PropTypes.func
    }

	state = {
		showBuildDetails: false,
		rerunDisabled: false
	}

	toggleShowDockunitSetup(event) {
        this.context.executeAction(updateShowDockunitSetup, {
        	showDockunitSetup: !this.props.ApplicationStore.showDockunitSetup,
        	repository: {}
        });
    }

	rerun(event) {
		event.preventDefault();

		this.setState({ showBuildDetails: false });

		this.props.rerun(this.props.build._id);
	}

	toggleBuildDetails() {
		this.setState({ showBuildDetails: !this.state.showBuildDetails });
	}

	componentDidMount() {
		let self = this;

		setInterval(function() {
			self.setState({lastRendered: new Date()});
		}, 20 * 1000); // Re-render every 20 seconds
	}

	render() {
		let statusClasses = 'status glyphicon ';
		let githubUrl = 'https://github.com/' + this.props.repository;
		let dockunitUrl = githubUrl + '/blob/' + this.props.branch + '/Dockunit.json';
		let commitUser = (this.props.build.commitUser) ? this.props.build.commitUser : 'Unknown';
		let userUrl = (this.props.build.commitUser) ? 'https://github.com/' + this.props.build.commitUser : '';

		if (this.props.build.finished) {
			if (255 === this.props.build.result) {
				statusClasses += 'glyphicon-exclamation-sign';
			} else if (0 < this.props.build.result) {
				statusClasses += 'glyphicon-remove';
			} else {
				statusClasses += 'glyphicon-ok';
			}
		} else {
			statusClasses += 'glyphicon-option-horizontal';
		}

		let buildDetailsClasses = 'build-details ';
    	if (!this.state.showBuildDetails) {
    		buildDetailsClasses += 'hide';
    	}

    	let buildShortCommit = ('pr' !== this.props.build.type) ? this.props.build.commit.replace(/^([a-z0-9]{0,9}).*$/i, '$1') : '';
    	let commitUrl = ('pr' !== this.props.build.type) ? githubUrl + '/commit/' + this.props.build.commit : '';
    	let repoBranchUrl = ('pr' !== this.props.build.type) ? 'https://github.com/' + this.props.repository + '/tree/' + this.props.build.branch : 'https://github.com/' + this.props.repository + '/tree/' + this.props.build.prBaseBranch;
    	let prBranchUrl = ('pr' !== this.props.build.type) ? '' : 'https://github.com/' + this.props.build.prRepositoryName + '/tree/' + this.props.build.prBranch;
    	let buildIdShort = this.props.build._id.replace(/^([a-z0-9]{0,9}).*$/i, '$1');
    	let prUrl = ('pr' !== this.props.build.type) ? '' : githubUrl + '/pull/' + this.props.build.prNumber;

    	let passFail = 'Passed';
    	if (255 === this.props.build.result) {
    		passFail = 'Errored';
    	} else if (0 < this.props.build.result) {
    		passFail = 'Failed';
    	}

    	let runTime = '';
    	if (this.props.build.finished) {
    		var runTimeCalc = ((new Date(this.props.build.finished) - new Date(this.props.build.started)) / 1000 / 60);

			if (runTimeCalc < 1) {
				runTimeCalc = Math.floor(runTimeCalc * 60);

				runTime = runTimeCalc + ' second' + ((runTimeCalc > 1 || 0 === runTimeCalc) ? 's' : '');
			} else {
				var runTimeCalc = Math.floor(runTimeCalc);

				runTime = runTimeCalc + ' minute' + ((runTimeCalc > 1 || 0 === runTimeCalc) ? 's' : '');
			}
    	}

    	// Very hacky way of handling special entities
    	let output = this.props.build.output
    		.replace(/\<span(.*?)\>/gi, '[#%span$1]')
    		.replace(/\<\/span\>/gi, '[#%/span]')
    		.replace(/\<u(.*?)\>/gi, '[#%u$1]')
    		.replace(/\<\/u\>/gi, '[#%/u]')
    		.replace(/&/g, '&amp;')
    		.replace(/\>/g, '&gt;')
    		.replace(/\</g, '&lt;')
    		.replace(/\[#%span(.*?)\]/g, '<span$1>')
    		.replace(/\[#%\/span\]/g, '</span>')
    		.replace(/\[#%u(.*?)\]/g, '<u$1>')
    		.replace(/\[#%\/u\]/g, '</u>');

    	output = output.trim().replace(/^(\r\n|\n|\r)/g, '').replace(/(?:\r\n|\r|\n)/g, '<br />');

		
    	let buildDetailsButtonsClasses = "btn btn-default expand";
    	if (!this.props.build.output) {
    		buildDetailsButtonsClasses += ' disabled';
    	}

    	let lastRan = '';
		if (!this.props.build.started && !this.props.build.finished) {
			lastRan = 'Queued to run';
		} else if (this.props.build.started && !this.props.build.finished) {
			lastRan = 'Started ' + timeago(this.props.build.started);
		}  else if (this.props.build.started && this.props.build.finished) {
			lastRan = 'Finished ' + timeago(this.props.build.started);
		}

    	let rerunDisabled = false;

    	if (!this.props.build.started || !this.props.build.finished) {
    		rerunDisabled = true;
    	} else {
    		if (this.state.rerunDisabled) {
    			rerunDisabled = true;
    		} 
    	}

		return (
			<div className="project-item latest-build jumbo">
				<div className="main">
					<span className={statusClasses}></span>

					<div className="left">
						<h2>Build #{buildIdShort}</h2>

						<div className="item">
							<If test={this.props.build.result === 255 && this.props.build.finished}>
								<div>
									Status: <strong>No Dockunit.json file found.&nbsp;</strong> 
									<If test={this.props.currentUser && this.props.currentUser._id === this.props.project.user}>
										<a className="add-dockunit" href="#" onClick={this.toggleShowDockunitSetup}>Add one?</a>
									</If>
								</div>
							</If>

							<If test={this.props.build.result !== 255 && this.props.build.finished}>
								<div>Status: <strong>{passFail} in {runTime}</strong></div>
							</If>

							<If test={!this.props.build.finished && this.props.build.started}>
								<div>Status: <strong>Not finished</strong></div>
							</If>

							<If test={!this.props.build.finished && !this.props.build.started}>
								<div>Status: <strong>Waiting to run</strong></div>
							</If>
						</div>
					</div>

					<div className="right">
						<div className="item"><strong>{lastRan}</strong></div>
						<If test={('pr' === this.props.build.type)}>
							<div className="item"><a href={prUrl}><strong>PR</strong></a> on <a href={repoBranchUrl}><strong>{this.props.build.prBaseUser}:{this.props.build.prBaseBranch}</strong></a> from <a href={prBranchUrl}><strong>{this.props.build.prUser}:{this.props.build.prBranch}</strong></a></div>
						</If>

						<If test={('pr' !== this.props.build.type)}>
							<div className="item">
								Commit <a href={commitUrl}><strong>{buildShortCommit}</strong></a> by <a href={userUrl}><strong>{commitUser}</strong></a>
							</div>
						</If>
						
						<div className="toolbar">
							<If test={this.props.currentUser}>
								<a onClick={this.rerun} disabled={rerunDisabled} className="btn btn-default" href="">Rerun <span className="glyphicon no-rotate glyphicon-refresh"></span></a>
							</If>

							<a className="btn btn-default" href={dockunitUrl}>Dockunit.json <span className="icon-logo"></span></a>
							<a className="btn btn-default" href={githubUrl}>Repo <span className="icomoon icomoon-github"></span></a>
							<a className={buildDetailsButtonsClasses} onClick={this.toggleBuildDetails}>
								Build Details 
								<If test={this.props.build.output}>
									<span>
										<If test={this.state.showBuildDetails}>
											<span className="glyphicon glyphicon-chevron-up" aria-hidden="true"></span>
										</If>

										<If test={!this.state.showBuildDetails}>
											<span className="glyphicon glyphicon-chevron-down" aria-hidden="true"></span>
										</If>
									</span>
								</If>
							</a>
						</div>
					</div>
				</div>

				<div className={buildDetailsClasses}>
					<div className="output" dangerouslySetInnerHTML={{__html: output}}>
					</div>
				</div>
			</div>
		);
	}
}

export default LatestBuildListItem;
