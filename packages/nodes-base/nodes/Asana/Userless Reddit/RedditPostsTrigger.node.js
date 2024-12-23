"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RedditPostsTrigger = void 0;
const n8n_workflow_1 = require("n8n-workflow");
class RedditPostsTrigger {
    constructor() {
        this.description = {
            displayName: 'Reddit Posts Trigger',
            name: 'redditPostsTrigger',
            group: ['trigger'],
            icon: 'file:reddit.svg',
            polling: true,
            version: 1,
            description: 'Starts a workflow when new Reddit posts published',
            defaults: {
                name: 'Reddit Posts Trigger',
            },
            documentationUrl: 'https://github.com/haohanyang/n8n-nodes-userless-reddit#reddit-posts-trigger',
            inputs: [],
            outputs: ['main'],
            credentials: [
                {
                    name: 'redditOAuth2ApplicationOnlyApi',
                    required: true,
                },
            ],
            properties: [
                {
                    displayName: 'Subreddit',
                    name: 'subreddit',
                    type: 'string',
                    default: '',
                    placeholder: 'Python',
                    description: 'Name of subreddit',
                    required: true,
                },
                {
                    displayName: 'Limit',
                    name: 'limit',
                    type: 'number',
                    typeOptions: {
                        minValue: 1,
                    },
                    default: 10,
                    description: 'Max number of results to return',
                },
            ],
        };
    }
    async poll() {
        const pollData = this.getWorkflowStaticData('node');
        const subreddit = this.getNodeParameter('subreddit');
        const itemLimit = this.getNodeParameter('limit');
        if (subreddit !== pollData.lastRedditPostSubreddit) {
            pollData.lastRedditPostSubreddit = subreddit;
            pollData.lastRedditPostId = undefined;
            pollData.lastRedditPostTimestamp = undefined;
        }
        const options = {
            method: 'GET',
            baseURL: 'https://oauth.reddit.com',
            url: `/r/${subreddit}/new`,
            headers: {
                'User-Agent': 'n8n',
            },
            qs: {
                limit: itemLimit,
            },
            json: true,
        };
        try {
            const responseData = await this.helpers.httpRequestWithAuthentication.call(this, 'redditOAuth2ApplicationOnlyApi', options);
            const posts = responseData.data.children
                .filter((c) => c.kind === 't3')
                .map((c) => c.data);
            posts.sort((a, b) => b.created - a.created);
            if (this.getMode() == 'manual') {
                return [this.helpers.returnJsonArray(posts)];
            }
            if (!pollData.lastRedditPostTimestamp) {
                if (posts.length > 0) {
                    pollData.lastRedditPostTimestamp = posts[0].created;
                    pollData.lastRedditPostId = posts[0].id;
                    return [this.helpers.returnJsonArray(posts)];
                }
                return null;
            }
            else {
                const newPosts = posts.filter((p) => p.created > pollData.lastRedditPostTimestamp);
                newPosts.sort((a, b) => b.created - a.created);
                if (newPosts.length > 0) {
                    pollData.lastRedditPostTimestamp = newPosts[0].created;
                    pollData.lastRedditPostId = newPosts[0].id;
                    return [this.helpers.returnJsonArray(newPosts)];
                }
                return null;
            }
        }
        catch (error) {
            throw new n8n_workflow_1.NodeOperationError(this.getNode(), error);
        }
    }
}
exports.RedditPostsTrigger = RedditPostsTrigger;
//# sourceMappingURL=RedditPostsTrigger.node.js.map