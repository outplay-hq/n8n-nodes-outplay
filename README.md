# n8n-nodes-outplay

This is an n8n community node. It lets you use Outplay in your n8n workflows.

Outplay is a sales engagement platform that helps sales teams automate their outreach and manage prospects effectively.

[n8n](https://n8n.io/) is a [fair-code licensed](https://docs.n8n.io/sustainable-use-license/) workflow automation platform.

[Installation](#installation)  
[Operations](#operations)  
[Credentials](#credentials)  
[Usage](#usage)  
[Compatibility](#compatibility)  
[Resources](#resources)  

## Installation

Follow the [installation guide](https://docs.n8n.io/integrations/community-nodes/installation/) in the n8n community nodes documentation.

### Quick Install

In your n8n instance, navigate to **Settings > Community Nodes** and search for `n8n-nodes-outplay`, then click install.

Alternatively, install via npm in your n8n installation:

```bash
npm install n8n-nodes-outplay
```

## Operations

This package provides two nodes for interacting with Outplay:

### 1. Outplay Node (Actions)

The Outplay node provides the following operations for managing prospects:

#### Prospect Resource

- **Save Prospect** - Create or update a prospect in Outplay
  - Required fields: Email, First Name, Last Name
  - Optional fields: Company, Designation, Phone, LinkedIn, Twitter, Facebook, City, State, Country, Timezone, Sequence Identifier
  - Support for custom fields and tags
  - Use this to add new prospects or update existing ones based on email

- **Get Prospect** - Retrieve prospect details by ID
  - Required field: Prospect ID
  - Returns complete prospect information including all custom fields and tags

### 2. Outplay Trigger Node (Triggers)

The Outplay Trigger node listens for real-time events from Outplay via webhooks:

- **Mail Received** (Event ID: 4) - Triggers when an email is received from a prospect
- **Prospect Created** (Event ID: 1) - Triggers when a new prospect is created in Outplay
- **Prospect Updated** (Event ID: 3) - Triggers when a prospect's information is updated
- **Prospect Opt-Out** (Event ID: 2) - Triggers when a prospect opts out of communications

## Credentials

To use this node, you need an Outplay account with API access.

### Prerequisites

1. Sign up for an [Outplay account](https://www.outplayhq.com/)
2. Navigate to **Settings > API Settings** in your Outplay dashboard
3. Generate your API credentials (Client ID and Client Secret)

### Authentication Setup

This node uses API Key authentication with the following required fields:

- **Location**: Your Outplay instance location (e.g., "US", "EU", "DEV")
  - This determines the API endpoint: `https://{location}-api.outplayhq.com/api/v1`
- **Client ID**: Your Outplay API Client ID
- **Client Secret**: Your Outplay API Client Secret

The credentials are authenticated using custom headers (`X-CLIENT-SECRET`) and query parameters (`client_id`).

### Setting Up Credentials in n8n

1. In your n8n workflow, click on the Outplay node
2. Click on the **Credential to connect with** dropdown
3. Click **Create New Credential**
4. Enter your Outplay API credentials:
   - Location (e.g., "US", "EU")
   - Client ID
   - Client Secret
5. Click **Save**

## Usage

### Example Workflow: Save a New Prospect

1. Add an **Outplay** node to your workflow
2. Select **Prospect** as the resource
3. Select **Save Prospect** as the operation
4. Fill in the required fields:
   - Email: `john.doe@example.com`
   - First Name: `John`
   - Last Name: `Doe`
5. Optionally add additional fields like Company, Designation, Phone, etc.
6. Add tags or custom fields as needed
7. Execute the node to create the prospect in Outplay

### Example Workflow: Listen for New Prospects

1. Add an **Outplay Trigger** node to your workflow
2. Select **Prospect Created** as the event
3. The trigger will automatically register a webhook with Outplay
4. When a new prospect is created in Outplay, the workflow will be triggered
5. Use subsequent nodes to process the prospect data (e.g., send notifications, update CRM, etc.)

### Example Workflow: Get Prospect Details

1. Add an **Outplay** node to your workflow
2. Select **Prospect** as the resource
3. Select **Get Prospect** as the operation
4. Enter the Prospect ID
5. Execute the node to retrieve the prospect's complete information

## Compatibility

- **Minimum n8n version**: 1.0.0
- **Tested with n8n version**: 1.119.1
- **n8n API version**: 1

## Development

This node was built using the official n8n-node-dev tool and follows all n8n community node guidelines:

- ✅ No external dependencies
- ✅ MIT License
- ✅ TypeScript implementation
- ✅ Passes n8n linter (`npm run lint`)
- ✅ English language only
- ✅ No environment variable or file system access
- ✅ Proper error handling and validation

## Resources

* [n8n community nodes documentation](https://docs.n8n.io/integrations/#community-nodes)
* [Outplay API Documentation](https://support.outplay.ai/#/)
* [Outplay Website](https://www.outplayhq.com/)
* [GitHub Repository](https://github.com/outplay/n8n-nodes-outplay)

## License

[MIT](LICENSE.md)

## Support

For issues or questions:
- Create an issue on [GitHub](https://github.com/outplay/n8n-nodes-outplay/issues)
- Contact Outplay support at [support.outplay.ai](https://support.outplay.ai/#/)

## Version History

See [CHANGELOG.md](CHANGELOG.md) for version history and updates.
