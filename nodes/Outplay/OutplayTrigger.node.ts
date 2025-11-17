import {
	IHookFunctions,
	IWebhookFunctions,
	INodeType,
	INodeTypeDescription,
	IWebhookResponseData,
	IDataObject,
	NodeOperationError,
} from 'n8n-workflow';

export class OutplayTrigger implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Outplay Webhook Trigger',
		name: 'outplayTrigger',
		icon: 'file:outplay-icon.svg',
		group: ['trigger'],
		version: 1,
		subtitle: '={{$parameter["event"]}}',
		description: 'Starts the workflow when Outplay events occur',
		defaults: {
			name: 'Outplay Webhook Trigger',
		},
		inputs: [],
		outputs: ['main'],
		credentials: [
			{
				name: 'outplayApi',
				required: true,
			},
		],
		webhooks: [
			{
				name: 'default',
				httpMethod: 'POST',
				responseMode: 'onReceived',
				path: 'webhook',
			},
		],
		properties: [
			{
				displayName: 'Event',
				name: 'event',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: 'Prospect Created',
						value: '1',
						description: 'Trigger when a new prospect is created in Outplay',
					},
					{
						name: 'Prospect Opt-Out',
						value: '2',
						description: 'Trigger when a prospect opts out from Outplay',
					},
					{
						name: 'Prospect Updated',
						value: '3',
						description: 'Trigger when a prospect is updated in Outplay',
					},
					{
						name: 'Mail Received',
						value: '4',
						description: 'Trigger when receiving a mail in Outplay from the prospect',
					},
				],
				default: '1',
				required: true,
				description: 'The event to listen to',
			},
		],
		usableAsTool: true,
	};

	webhookMethods = {
		default: {
			async checkExists(this: IHookFunctions): Promise<boolean> {
				const webhookData = this.getWorkflowStaticData('node');

				if (webhookData.webhookId === undefined) {
					return false;
				}

				const currentEvent = this.getNodeParameter('event') as string;
				const storedEvent = webhookData.webhookEvent as string;

				if (storedEvent && currentEvent !== storedEvent) {
					const oldWebhookUrl = (webhookData.webhookUrl as string) || this.getNodeWebhookUrl('default');
					const credentials = await this.getCredentials('outplayApi');
					const location = (credentials.location as string).toLowerCase();
					const baseURL = `https://${location}-api.outplayhq.com/api/v1`;
				try {
					await this.helpers.httpRequestWithAuthentication.call(
						this,
						'outplayApi',
						{
							method: 'POST',
							baseURL: baseURL,
							url: '/account/UnsubscribeWebHook',
							qs: {
								target_url: oldWebhookUrl,
								event: storedEvent,
							},
							headers: {
								'Content-Type': 'application/x-www-form-urlencoded',
							},
						},
					);
				} catch (error) {
					const errorMessage = error instanceof Error ? error.message : 'Unknown error';
					const statusCode = error instanceof Error ? (error as unknown as {statusCode?: number}).statusCode : undefined;
					console.error('❌ Failed to unsubscribe old event');
					console.error('Status:', statusCode, 'Error:', errorMessage);
				}				
					delete webhookData.webhookId;
					delete webhookData.webhookEvent;
					delete webhookData.webhookUrl;
					
					return false;
				}

				
				// Outplay doesn't provide a GET endpoint to check webhook existence
				// We assume it exists if we have the ID stored
				return true;
			},

			async create(this: IHookFunctions): Promise<boolean> {
				const webhookUrl = this.getNodeWebhookUrl('default') as string;
				
				// NOTE: For local development with webhooks, you may need to use a tunneling service
				// like ngrok to expose your local n8n instance to the internet

				const event = this.getNodeParameter('event') as string;
				const credentials = await this.getCredentials('outplayApi');
				const location = (credentials.location as string).toLowerCase();
				const baseURL = `https://${location}-api.outplayhq.com/api/v1`;


				const body = {
					target_url: webhookUrl,
					event: event,
				};

				const webhookData = this.getWorkflowStaticData('node');

			try {
				const responseData = await this.helpers.httpRequestWithAuthentication.call(
					this,
					'outplayApi',
					{
						method: 'POST',
						baseURL: baseURL,
						url: '/account/SubscribeWebHook',
						body,
						headers: {
							'User-Agent': 'n8n',
						},
					},
				);					

					webhookData.webhookId = responseData.id || `webhook_${event}_${Date.now()}`;
					webhookData.webhookEvent = event;
					webhookData.webhookUrl = webhookUrl; 

					return true;
				} catch (error) {
					const errorMessage = error instanceof Error ? error.message : 'Unknown error';
					const statusCode = error instanceof Error ? (error as unknown as {statusCode?: number}).statusCode : undefined;
					
					console.error('❌ Webhook subscription FAILED');
					console.error('Status:', statusCode);
					console.error('Error:', errorMessage);
					
					throw new NodeOperationError(
						this.getNode(),
						`Failed to subscribe webhook in Outplay (Status: ${statusCode}): ${errorMessage}`,
					);
				}
			},

			async delete(this: IHookFunctions): Promise<boolean> {
				const webhookData = this.getWorkflowStaticData('node');
				const webhookUrl = (webhookData.webhookUrl as string) || this.getNodeWebhookUrl('default');
				const event = (webhookData.webhookEvent as string) || (this.getNodeParameter('event') as string);

				if (!webhookUrl) {
					console.log('No webhook to unsubscribe');
					return true;
				}

				const credentials = await this.getCredentials('outplayApi');
				const location = (credentials.location as string).toLowerCase();
				const baseURL = `https://${location}-api.outplayhq.com/api/v1`;

			try {
				await this.helpers.httpRequestWithAuthentication.call(
					this,
					'outplayApi',
					{
						method: 'POST',
						baseURL: baseURL,
						url: '/account/UnsubscribeWebHook',
						qs: {
							target_url: webhookUrl,
							event: event,
						},
						headers: {
							'Content-Type': 'application/x-www-form-urlencoded',
						},
					},
				);	
					delete webhookData.webhookId;
					delete webhookData.webhookEvent;
					delete webhookData.webhookUrl;

					return true;
				} catch (error) {
					const errorMessage = error instanceof Error ? error.message : 'Unknown error';
					const statusCode = error instanceof Error ? (error as unknown as {statusCode?: number}).statusCode : undefined;
					const responseBody = error instanceof Error ? (error as unknown as {response?: {body?: unknown}}).response?.body : undefined;
					
					console.error('\n❌ Webhook unsubscription FAILED');
					console.error('Status:', statusCode);
					console.error('Error:', errorMessage);
					console.error('Response:', responseBody);
					
					throw new NodeOperationError(
						this.getNode(),
						`Failed to unsubscribe webhook in Outplay (Status: ${statusCode}): ${errorMessage}`,
					);
				}
			},
		},
	};

	async webhook(this: IWebhookFunctions): Promise<IWebhookResponseData> {
		const bodyData = this.getBodyData();
		const event = this.getNodeParameter('event') as string;

		// Check if the webhook is a test/ping from Outplay
		if (bodyData.ping || bodyData.test) {
			console.log('⚠️ Ping/test webhook received, ignoring');
			// Return OK but don't start workflow
			return {
				webhookResponse: 'OK',
			};
		}

		// Validate that the incoming webhook matches our event type
		// Outplay sends event as number (1, 2, 3, 4)
		if (bodyData.event && String(bodyData.event) !== event) {
			return {
				webhookResponse: 'Ignored - wrong event type',
			};
		}
		// Return the webhook data to start the workflow
		const returnData: IDataObject[] = [];

		returnData.push({
			body: bodyData,
			headers: this.getHeaderData(),
			query: this.getQueryData(),
		});

		return {
			workflowData: [this.helpers.returnJsonArray(returnData)],
		};
	}
}
