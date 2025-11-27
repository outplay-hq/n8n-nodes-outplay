import {
	IAuthenticateGeneric,
	ICredentialTestRequest,
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

export class OutplayApi implements ICredentialType {
	name = 'outplayApi';
	displayName = 'Outplay API';
	documentationUrl = 'https://support.outplay.ai/#/article/8216';
	readonly icon = {
		light: 'file:outplay-icon.svg',
		dark: 'file:outplay-icon.svg',
	} as const;
	properties: INodeProperties[] = [
		{
			displayName: '⚠️ Before creating: Check if you already have Outplay credentials saved. Avoid creating duplicates with the same Client ID.',
			name: 'notice',
			type: 'notice',
			default: '',
		},
		{
			displayName: 'Location',
			name: 'location',
			type: 'string',
			default: '',
			placeholder: 'US',
			required: true,
			description: 'Your Outplay instance location',
		},
		{
			displayName: 'Client ID',
			name: 'clientId',
			type: 'string',
			default: '',
			required: true,
			placeholder: 'e.g. abc123xyz',
			description: 'Your Outplay Client ID from API settings. Note: Use a unique Credential Name above to distinguish between multiple accounts.',
		},
		{
			displayName: 'Client Secret',
			name: 'clientSecret',
			type: 'string',
			typeOptions: { password: true },
			default: '',
			required: true,
			description: 'Your Outplay Client Secret from API settings.',
		},
	];

	authenticate: IAuthenticateGeneric = {
		type: 'generic',
		properties: {
			headers: {
				'X-CLIENT-SECRET': '={{$credentials.clientSecret}}',
			},
			qs: {
				client_id: '={{$credentials.clientId}}',
			},
		},
	};

	test: ICredentialTestRequest = {
		request: {
			baseURL: '={{$credentials.location ? "https://" + $credentials.location.toLowerCase() + "-api.outplayhq.com/api/v1" : "https://dev-api.outplayhq.com/api/v1"}}',
			url: '/account/Ping',
			method: 'GET',
		},
	};
}
