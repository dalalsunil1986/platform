'use strict';

import React from 'react';
import If from './If';
import {connectToStores} from 'fluxible-addons-react';
import readPosts from '../actions/readPosts';
import PostsStore from '../stores/PostsStore';
import Post from './Post';

@connectToStores(['PostsStore'], (context, props) => ({
    PostsStore: context.getStore(PostsStore).getState()
}))
class Blog extends React.Component {
	constructor(props, context) {
        super(props, context);
    }

	static contextTypes = {
        getStore: React.PropTypes.func.isRequired,
        executeAction: React.PropTypes.func
    }
	
	componentDidMount() {
		if (false === this.props.PostsStore.mainLoadComplete) {
			this.context.executeAction(readPosts);
		}
	}

    render() {
    	let posts = Object.keys(this.props.PostsStore.posts).map(function(key) {
    		return this.props.PostsStore.posts[key];
    	}, this);

    	return (
            <div className="container">
				<div className="blog">
					<If test={false === this.props.PostsStore.mainLoadComplete}>
						<div className="loading-section">
							<h3><span className="glyphicon glyphicon-refresh" aria-hidden="true"></span></h3>
						</div>
					</If>

					<If test={this.props.PostsStore.mainLoadComplete && posts && !posts.length}>
						<h3>Hey, no posts to show right now. Check back later!</h3>
					</If>

					<If test={this.props.PostsStore.mainLoadComplete && posts && posts.length}>
						<div className="posts">
							{posts && posts.map(function(post) {
								if (post) {
									return <Post post={post} />
								}   
			                })}
		                </div>
					</If>
				</div>
			</div>
        );
    }
}

export default Blog;
