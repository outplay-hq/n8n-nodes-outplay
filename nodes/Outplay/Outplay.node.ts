import {
	IExecuteFunctions,
	ILoadOptionsFunctions,
	INodeExecutionData,
	INodePropertyOptions,
	INodeType,
	INodeTypeDescription,
	IDataObject,
	NodeApiError,
} from 'n8n-workflow';

export class Outplay implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Outplay',
		name: 'outplay',
		icon: 'file:outplay-icon.svg',
		group: ['output'],
		version: [1],
		subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
		description: 'Interact with Outplay API',

		codex: {
			categories: ['CRM'],
			subcategories: {
				CRM: ['Leads', 'Contacts'],
			},
			resources: {
				primaryDocumentation: [
					{
						url: 'https://support.outplay.ai/#/',
					},
				],
			},
		},

		defaults: {
			name: 'Outplay',
		},
		inputs: ['main'],
		outputs: ['main'],
		credentials: [
			{
				name: 'outplayApi',
				required: true,
			},
		],
		requestDefaults: {
			baseURL: 'https://dev-api.outplayhq.com/api/v1',
			headers: {
				Accept: 'application/json',
				'Content-Type': 'application/json',
			},
		},
		properties: [
			// Resources
			{
				displayName: 'Resource',
				name: 'resource',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: 'Prospect',
						value: 'prospect',
					},
					{
						name: 'Scheduler',
						value: 'scheduler',
					},
				],
				default: 'prospect',
			},

			// Prospect Operations
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['prospect'],
					},
				},
				options: [
					{
						name: 'Save Prospect',
						value: 'save',
						description: 'Save a new prospect',
						action: 'Save a prospect',
					},
					{
						name: 'Get Prospect',
						value: 'get',
						description: 'Get a prospect by ID',
						action: 'Get a prospect',
					},
				],
				default: 'save',
			},

			// Scheduler Operations
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['scheduler'],
					},
				},
				options: [
					{
						name: 'Create',
						value: 'create',
						description: 'Create a scheduler lead with meeting type',
						action: 'Create a scheduler lead',
					},
				],
				default: 'create',
			},

			// Scheduler Fields - Meeting Type
			{
				displayName: 'Meeting Type Name or ID',
				name: 'meetingType',
				type: 'options',
				typeOptions: {
					loadOptionsMethod: 'getMeetingTypes',
				},
				required: true,
				displayOptions: {
					show: {
						resource: ['scheduler'],
						operation: ['create'],
					},
				},
				default: '',
				description: 'Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>',
			},

			// Scheduler Fields - Fields
			{
				displayName: 'Fields',
				name: 'fields',
				type: 'fixedCollection',
				typeOptions: {
					multipleValues: true,
				},
				placeholder: 'Add Field',
				default: {},
				required: true,
				displayOptions: {
					show: {
						resource: ['scheduler'],
						operation: ['create'],
					},
				},
				options: [
					{
						name: 'field',
						displayName: 'Field',
						values: [
							{
								displayName: 'Field Name or ID',
								name: 'fieldIdentifier',
								type: 'string',
								typeOptions: {
									loadOptionsMethod: 'getMeetingFormFields',
									loadOptionsDependsOn: ['meetingType'],
								},
								default: '',
								description: 'Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>',
							},
							{
								displayName: 'Field Value',
								name: 'fieldValue',
								type: 'string',
								default: '',
								description: 'The value for this field',
							},
						],
					},
				],
				description: 'Field identifiers and values for the scheduler lead',
			},

			// Prospect Fields - Get
			{
				displayName: 'Prospect ID',
				name: 'prospectId',
				type: 'string',
				required: true,
				displayOptions: {
					show: {
						resource: ['prospect'],
						operation: ['get'],
					},
				},
				default: '',
				placeholder: 'e.g. 12345',
				description: 'The ID of the prospect to retrieve',
			},

			// Prospect Fields - Save
			{
				displayName: 'Email',
				name: 'emailid',
				type: 'string',
				placeholder: 'e.g. nathan@n8n.io',
				required: true,
				displayOptions: {
					show: {
						resource: ['prospect'],
						operation: ['save'],
					},
				},
				default: '',
				description: 'Email address (must be unique)',
			},
			{
				displayName: 'First Name',
				name: 'firstname',
				type: 'string',
				displayOptions: {
					show: {
						resource: ['prospect'],
						operation: ['save'],
					},
				},
				default: '',
				description: 'The prospect\'s first name',
			},
			{
				displayName: 'Last Name',
				name: 'lastname',
				type: 'string',
				displayOptions: {
					show: {
						resource: ['prospect'],
						operation: ['save'],
					},
				},
				default: '',
				description: 'The prospect\'s last name',
			},
			{
				displayName: 'Additional Fields',
				name: 'additionalFields',
				type: 'collection',
				placeholder: 'Add Field',
				default: {},
				displayOptions: {
					show: {
						resource: ['prospect'],
						operation: ['save'],
					},
				},
				options: [
					{
						displayName: 'City',
						name: 'city',
						type: 'string',
						default: '',

					},
					{
						displayName: 'Company',
						name: 'company',
						type: 'string',
						default: '',
						placeholder: 'e.g. Acme Corp',
						description: 'Company or organization name',
					},
					{
						displayName: 'Country',
						name: 'country',
						type: 'string',
						default: '',

					},
					{
						displayName: 'Designation',
						name: 'designation',
						type: 'string',
						default: '',
						placeholder: 'e.g. Sales Manager',
						description: 'Job title or designation',
					},
					{
						displayName: 'Facebook',
						name: 'facebook',
						type: 'string',
						default: '',
						placeholder: 'e.g. https://facebook.com/username',
						description: 'Facebook profile URL',
					},
					{
						displayName: 'LinkedIn',
						name: 'linkedin',
						type: 'string',
						default: '',
						placeholder: 'e.g. https://linkedin.com/in/username',
						description: 'LinkedIn profile URL',
					},
					{
						displayName: 'Phone',
						name: 'phone',
						type: 'string',
						default: '',
						placeholder: 'e.g. +1234567890',
						description: 'Phone number',
					},
					{
						displayName: 'Sequence Identifier',
						name: 'sequenceidentifier',
						type: 'string',
						default: '',
						placeholder: 'e.g. my-sequence-ID',
						description: 'Identifier for the sequence to add the prospect to',
					},
					{
						displayName: 'State',
						name: 'state',
						type: 'string',
						default: '',

					},
					{
						displayName: 'Timezone',
						name: 'timezone',
						type: 'string',
						default: '',
						placeholder: 'e.g. America/Los_Angeles',
						description: 'Timezone in IANA format (e.g., America/Los_Angeles)',
					},
					{
						displayName: 'Twitter',
						name: 'twitter',
						type: 'string',
						default: '',
						placeholder: 'e.g. @username',
						description: 'Twitter handle',
					},
				],
			},
			{
				displayName: 'Tags',
				name: 'tags',
				type: 'fixedCollection',
				typeOptions: {
					multipleValues: true,
				},
				placeholder: 'Add Tag',
				default: {},
				displayOptions: {
					show: {
						resource: ['prospect'],
						operation: ['save'],
					},
				},
				options: [
					{
						name: 'tag',
						displayName: 'Tag',
						values: [
							{
								displayName: 'Tag Name',
								name: 'value',
								type: 'string',
								default: '',
								placeholder: 'e.g. vip',
								description: 'Tag to assign to the prospect',
							},
						],
					},
				],
				description: 'Tags to assign to the prospect',
			},
			{
				displayName: 'Custom Fields',
				name: 'customFields',
				type: 'fixedCollection',
				typeOptions: {
					multipleValues: true,
				},
				placeholder: 'Add Custom Field',
				default: {},
				displayOptions: {
					show: {
						resource: ['prospect'],
						operation: ['save'],
					},
				},
				options: [
					{
						name: 'field',
						displayName: 'Field',
						values: [
							{
								displayName: 'Field Name',
								name: 'name',
								type: 'string',
								default: '',
								description: 'Name of the custom field',
							},
							{
								displayName: 'Field Value',
								name: 'value',
								type: 'string',
								default: '',
								description: 'Value of the custom field',
							},
						],
					},
				],
				description: 'Additional custom fields as key-value pairs',
			},
		],
		usableAsTool: true,
	};

	methods = {
		loadOptions: {
			async getMeetingTypes(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
				try {
					const credentials = await this.getCredentials('outplayApi');
					const location = (credentials.location as string).toLowerCase();
					const baseURL = `https://${location}-api.outplayhq.com/api/v1`;

					const responseData = await this.helpers.httpRequestWithAuthentication.call(
						this,
						'outplayApi',
						{
							method: 'GET',
							baseURL: baseURL,
							url: '/Scheduler/GetMeetingType',
							json: true,
						},
					);

					const meetingTypes = responseData as Array<{
						MeetingId: number;
						MeetingType: string;
						Slug: string;
					}>;

					return meetingTypes.map((meeting) => ({
						name: meeting.MeetingType,
						value: `${meeting.MeetingId}::${meeting.Slug}`,
					}));
				} catch {
					return [];
				}
			},

			async getMeetingFormFields(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
				try {
					const credentials = await this.getCredentials('outplayApi');
					const location = (credentials.location as string).toLowerCase();
					const baseURL = `https://${location}-api.outplayhq.com/api/v1`;

					const meetingType = this.getNodeParameter('meetingType') as string;
					
					// Return empty array if no meeting type is selected yet
					if (!meetingType || meetingType.trim() === '') {
						return [];
					}
					
					// Parse meeting type flexibly: "id", "slug", or "id::slug"
					let meetingTypeId: string | undefined;
					let meetingTypeSlug: string | undefined;
					
					if (meetingType.includes('::')) {
						// Format: "id::slug"
						[meetingTypeId, meetingTypeSlug] = meetingType.split('::');
					} else if (/^\d+$/.test(meetingType)) {
						// Numeric only: just ID
						meetingTypeId = meetingType;
					} else {
						// Non-numeric: just slug
						meetingTypeSlug = meetingType;
					}

					// Build query string with only provided parameters
					const qs: IDataObject = {};
					if (meetingTypeId) qs.meetingtypeid = meetingTypeId;
					if (meetingTypeSlug) qs.meetingtypeslug = meetingTypeSlug;

					const responseData = await this.helpers.httpRequestWithAuthentication.call(
						this,
						'outplayApi',
						{
							method: 'GET',
							baseURL: baseURL,
							url: '/Scheduler/GetMeetingFormFields',
							qs,
							json: true,
						},
					);

					const result = responseData as {
						success: boolean;
						data: {
							fields: {
								[key: string]: {
									fieldname: string;
									ismandatory: boolean;
								};
							};
						};
					};

					if (!result.success || !result.data || !result.data.fields) {
						return [];
					}

					const fields = result.data.fields;
					return Object.entries(fields).map(([identifier, fieldData]) => ({
						name: `${fieldData.fieldname}${fieldData.ismandatory ? ' (Required)' : ''}`,
						value: identifier,
					}));
				} catch {
					return [];
				}
			},
		},
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];
		const resource = this.getNodeParameter('resource', 0);
		const operation = this.getNodeParameter('operation', 0);

		const credentials = await this.getCredentials('outplayApi');
		const location = (credentials.location as string).toLowerCase();
		const baseURL = `https://${location}-api.outplayhq.com/api/v1`;

	
		for (let i = 0; i < items.length; i++) {
			try {
				if (resource === 'prospect') {
					if (operation === 'save') {
						// Save prospect
						const emailid = this.getNodeParameter('emailid', i) as string;
						const firstname = this.getNodeParameter('firstname', i) as string;
						const lastname = this.getNodeParameter('lastname', i) as string;
						const additionalFields = this.getNodeParameter('additionalFields', i) as IDataObject;
						const tagsCollection = this.getNodeParameter('tags', i) as IDataObject;
						const customFields = this.getNodeParameter('customFields', i) as IDataObject;

						const body: IDataObject = {
							emailid,
							firstname,
							lastname,
							...additionalFields,
						};

						// Convert tags from fixedCollection to array of strings
						if (tagsCollection && tagsCollection.tag) {
							const tagArray = tagsCollection.tag as Array<{ value: string }>;
							const tags: string[] = [];
							for (const tag of tagArray) {
								if (tag.value) {
									tags.push(tag.value);
								}
							}
							if (tags.length > 0) {
								body.tags = tags;
							}
						}

						// Add custom fields if provided
						if (customFields && customFields.field) {
							const fields: IDataObject = {};
							const fieldArray = customFields.field as Array<{ name: string; value: string }>;
							for (const field of fieldArray) {
								if (field.name && field.value) {
									fields[field.name] = field.value;
								}
							}
							if (Object.keys(fields).length > 0) {
								body.fields = fields;
							}
						}

						const responseData = await this.helpers.httpRequestWithAuthentication.call(
							this,
							'outplayApi',
							{
								method: 'POST',
								baseURL: baseURL,
								url: '/prospect/add',
								body,
								json: true,
							},
						);

						returnData.push({ 
							json: responseData as IDataObject,
							pairedItem: { item: i }
						});
					} else if (operation === 'get') {
						// Get prospect by ID
						const prospectId = this.getNodeParameter('prospectId', i) as string;

						const responseData = await this.helpers.httpRequestWithAuthentication.call(
							this,
							'outplayApi',
							{
								method: 'GET',
								baseURL: baseURL,
								url: `/prospect/${prospectId}`,
								json: true,
							},
						);

						returnData.push({ 
							json: responseData as IDataObject,
							pairedItem: { item: i }
						});
					}
				} else if (resource === 'scheduler') {
				if (operation === 'create') {
					// Create Scheduler Lead
						const meetingType = this.getNodeParameter('meetingType', i) as string;
						const fieldsCollection = this.getNodeParameter('fields', i) as IDataObject;

						// Parse meeting type flexibly: "id", "slug", or "id::slug"
						let meetingTypeSlug: string | undefined;
						
						if (meetingType.includes('::')) {
							// Format: "id::slug" - extract slug only
							[, meetingTypeSlug] = meetingType.split('::');
						} else if (/^\d+$/.test(meetingType)) {
							// Numeric only: ID provided, but we need slug for this API
							// Leave undefined - API may handle or throw error
							meetingTypeSlug = undefined;
						} else {
							// Non-numeric: just slug
							meetingTypeSlug = meetingType;
						}

						// Convert fields from fixedCollection to array format
						const fieldsArray: Array<{ fieldIdentifier: string; fieldValue: string }> = [];
						if (fieldsCollection && fieldsCollection.field) {
							const fieldArray = fieldsCollection.field as Array<{ fieldIdentifier: string; fieldValue: string }>;
							for (const field of fieldArray) {
								if (field.fieldIdentifier && field.fieldValue) {
									fieldsArray.push({
										fieldIdentifier: field.fieldIdentifier,
										fieldValue: field.fieldValue,
									});
								}
							}
						}

						const body: IDataObject = {
							fields: fieldsArray,
							meetingTypeSlug: meetingTypeSlug,
							UtmSource: 'n8n',
						};

						const responseData = await this.helpers.httpRequestWithAuthentication.call(
							this,
							'outplayApi',
							{
								method: 'POST',
								baseURL: baseURL,
								url: '/Scheduler/PostLeadInfo',
								body,
								json: true,
							},
						);

						returnData.push({ 
							json: responseData as IDataObject,
							pairedItem: { item: i }
						});
					}
				}
			} catch (error) {
				if (this.continueOnFail()) {

					const errorMessage =
						error instanceof NodeApiError
							? error.message
							: error instanceof Error
							? error.message
							: 'Unknown API error';

					returnData.push({
						json: {
							error: errorMessage,
							resource,
							operation,
							itemIndex: i,
						},
						pairedItem: { item: i },
					});

					continue;
				}
				
				throw new NodeApiError(this.getNode(), error, { itemIndex: i });
			}
		}

		return [returnData];
	}
}
