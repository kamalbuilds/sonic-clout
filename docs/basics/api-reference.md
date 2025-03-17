---
description: API reference for SonicClout platform
---

# API Reference

SonicClout provides a set of APIs for interacting with the platform programmatically. This reference documents the available endpoints, authentication requirements, and example requests.

## Base URLs

- **Production API**: `https://api.sonicclout.io/v1`
- **Staging API**: `https://api-staging.sonicclout.io/v1`
- **Local Development**: `http://localhost:3001/v1`

## Authentication

Most API endpoints require authentication using a JWT token:

```
Authorization: Bearer <token>
```

To obtain a token, use the `/auth/login` endpoint with your credentials.

## Rate Limiting

API requests are rate limited to:
- 100 requests per minute for authenticated users
- 20 requests per minute for unauthenticated users

Exceeding these limits will result in a `429 Too Many Requests` response.

## Content Endpoints

### List Content

```
GET /content
```

Returns a paginated list of content tokens.

#### Query Parameters

| Parameter | Type   | Description                                      |
|-----------|--------|--------------------------------------------------|
| page      | number | Page number (default: 1)                         |
| limit     | number | Items per page (default: 20, max: 100)           |
| sort      | string | Sort field (created_at, popularity, price)       |
| order     | string | Sort order (asc, desc)                           |
| creator   | string | Filter by creator address                        |
| type      | string | Filter by content type (post, image, video, etc.) |

#### Response Example

```json
{
  "data": [
    {
      "id": "content_12345",
      "name": "My Awesome Content",
      "symbol": "MAC",
      "content_type": "post",
      "content_hash": "QmHash...",
      "creator_address": "7Zb1...FbK2",
      "total_supply": 1000000,
      "current_price": 0.5,
      "created_at": "2023-06-15T12:00:00Z",
      "metadata": {
        "title": "My First Content",
        "description": "This is my first tokenized content!",
        "image_url": "https://sonicclout.io/content/12345.png"
      }
    },
    // More content items...
  ],
  "pagination": {
    "total_items": 156,
    "total_pages": 8,
    "current_page": 1,
    "limit": 20
  }
}
```

### Get Content Details

```
GET /content/:id
```

Returns detailed information about a specific content token.

#### Path Parameters

| Parameter | Type   | Description             |
|-----------|--------|-------------------------|
| id        | string | Content ID              |

#### Response Example

```json
{
  "id": "content_12345",
  "name": "My Awesome Content",
  "symbol": "MAC",
  "content_type": "post",
  "content_hash": "QmHash...",
  "creator_address": "7Zb1...FbK2",
  "total_supply": 1000000,
  "current_price": 0.5,
  "created_at": "2023-06-15T12:00:00Z",
  "metadata": {
    "title": "My First Content",
    "description": "This is my first tokenized content!",
    "image_url": "https://sonicclout.io/content/12345.png"
  },
  "social_metrics": {
    "views": 15240,
    "likes": 1250,
    "shares": 342,
    "comments": 89
  },
  "token_metrics": {
    "holders": 156,
    "volume_24h": 25000,
    "price_change_24h": 5.2
  }
}
```

### Create Content

```
POST /content
```

Creates a new content token.

#### Request Body

```json
{
  "name": "My New Content",
  "symbol": "MNC",
  "content_type": "image",
  "total_supply": 500000,
  "decimals": 9,
  "metadata": {
    "title": "My New Artwork",
    "description": "A beautiful digital artwork",
    "image_url": "https://example.com/my-artwork.png"
  }
}
```

#### Response Example

```json
{
  "id": "content_67890",
  "name": "My New Content",
  "symbol": "MNC",
  "content_type": "image",
  "content_hash": "QmNewHash...",
  "creator_address": "7Zb1...FbK2",
  "total_supply": 500000,
  "current_price": 0,
  "created_at": "2023-08-22T15:30:00Z",
  "transaction_id": "4xT2...jK9z",
  "metadata": {
    "title": "My New Artwork",
    "description": "A beautiful digital artwork",
    "image_url": "https://example.com/my-artwork.png"
  }
}
```

## Vesting Endpoints

### List Vesting Schedules

```
GET /vesting
```

Returns a list of vesting schedules for the authenticated user.

#### Response Example

```json
{
  "data": [
    {
      "id": "vesting_12345",
      "token_id": "content_12345",
      "token_name": "My Awesome Content",
      "token_symbol": "MAC",
      "total_amount": 1000000,
      "unlocked_amount": 200000,
      "metric_type": "followers",
      "milestones": [
        {
          "threshold": 1000,
          "percentage": 20,
          "status": "reached"
        },
        {
          "threshold": 5000,
          "percentage": 30,
          "status": "pending"
        },
        {
          "threshold": 10000,
          "percentage": 50,
          "status": "pending"
        }
      ],
      "created_at": "2023-06-15T12:00:00Z"
    },
    // More vesting schedules...
  ]
}
```

### Create Vesting Schedule

```
POST /vesting
```

Creates a new vesting schedule.

#### Request Body

```json
{
  "token_id": "content_12345",
  "amount": 1000000,
  "metric_type": "followers",
  "milestones": [
    {
      "threshold": 1000,
      "percentage": 20
    },
    {
      "threshold": 5000,
      "percentage": 30
    },
    {
      "threshold": 10000,
      "percentage": 50
    }
  ]
}
```

#### Response Example

```json
{
  "id": "vesting_67890",
  "token_id": "content_12345",
  "token_name": "My Awesome Content",
  "token_symbol": "MAC",
  "total_amount": 1000000,
  "unlocked_amount": 0,
  "metric_type": "followers",
  "milestones": [
    {
      "threshold": 1000,
      "percentage": 20,
      "status": "pending"
    },
    {
      "threshold": 5000,
      "percentage": 30,
      "status": "pending"
    },
    {
      "threshold": 10000,
      "percentage": 50,
      "status": "pending"
    }
  ],
  "created_at": "2023-08-22T15:30:00Z",
  "transaction_id": "5yU3...kL0a"
}
```

### Check Milestones

```
POST /vesting/:id/check
```

Checks milestone status for a vesting schedule.

#### Path Parameters

| Parameter | Type   | Description             |
|-----------|--------|-------------------------|
| id        | string | Vesting schedule ID     |

#### Response Example

```json
{
  "id": "vesting_12345",
  "current_metric_value": 1200,
  "milestones": [
    {
      "threshold": 1000,
      "percentage": 20,
      "status": "reached"
    },
    {
      "threshold": 5000,
      "percentage": 30,
      "status": "pending"
    },
    {
      "threshold": 10000,
      "percentage": 50,
      "status": "pending"
    }
  ],
  "unlocked_amount": 200000,
  "unlocked_percentage": 20,
  "transaction_id": "6zV4...lM1b"
}
```

## Trading Endpoints

### Get Token Pairs

```
GET /trading/pairs
```

Returns available token pairs for trading.

#### Response Example

```json
{
  "data": [
    {
      "id": "pair_12345",
      "token0": {
        "id": "content_12345",
        "name": "My Awesome Content",
        "symbol": "MAC",
        "decimals": 9
      },
      "token1": {
        "id": "SOL",
        "name": "Solana",
        "symbol": "SOL",
        "decimals": 9
      },
      "price": 0.5,
      "volume_24h": 125000,
      "liquidity": 250000,
      "fee_tier": 0.3
    },
    // More pairs...
  ]
}
```

### Get Swap Quote

```
GET /trading/quote
```

Returns a quote for a token swap.

#### Query Parameters

| Parameter  | Type   | Description                         |
|------------|--------|-------------------------------------|
| tokenIn    | string | Input token ID or address           |
| tokenOut   | string | Output token ID or address          |
| amountIn   | string | Input amount (in smallest units)    |
| slippage   | number | Maximum slippage percentage         |

#### Response Example

```json
{
  "id": "quote_12345",
  "tokenIn": "content_12345",
  "tokenInSymbol": "MAC",
  "amountIn": "1000000000",
  "tokenOut": "SOL",
  "tokenOutSymbol": "SOL",
  "amountOut": "500000000",
  "minAmountOut": "495000000",
  "price": 0.5,
  "priceImpact": 0.2,
  "fee": "3000000",
  "route": [
    {
      "poolId": "pool_12345",
      "tokenIn": "content_12345",
      "tokenOut": "SOL",
      "fee": 0.3
    }
  ],
  "expires_at": "2023-08-22T15:35:00Z"
}
```

## User Endpoints

### Get User Profile

```
GET /users/me
```

Returns the profile of the authenticated user.

#### Response Example

```json
{
  "id": "user_12345",
  "address": "7Zb1...FbK2",
  "username": "creator123",
  "display_name": "Amazing Creator",
  "bio": "Creating awesome content on SonicClout",
  "profile_image": "https://sonicclout.io/profiles/creator123.png",
  "social_metrics": {
    "followers": 1250,
    "following": 350,
    "content_count": 15
  },
  "creator_metrics": {
    "total_content": 5,
    "total_volume": 250000,
    "total_holders": 325
  },
  "created_at": "2023-01-15T12:00:00Z"
}
```

### Get Creator Profile

```
GET /users/:address
```

Returns the profile of a specific creator.

#### Path Parameters

| Parameter | Type   | Description                 |
|-----------|--------|-----------------------------|
| address   | string | Creator's wallet address    |

#### Response Example

```json
{
  "id": "user_67890",
  "address": "8Ac2...GcL3",
  "username": "famous_creator",
  "display_name": "Famous Creator",
  "bio": "Top creator on SonicClout",
  "profile_image": "https://sonicclout.io/profiles/famous_creator.png",
  "social_metrics": {
    "followers": 25000,
    "following": 150,
    "content_count": 45
  },
  "creator_metrics": {
    "total_content": 30,
    "total_volume": 1500000,
    "total_holders": 2500
  },
  "created_at": "2022-10-05T09:30:00Z"
}
```

## Error Responses

All API endpoints return standard error responses:

### 400 Bad Request

```json
{
  "error": {
    "code": "BAD_REQUEST",
    "message": "Invalid parameters",
    "details": {
      "name": "Name is required"
    }
  }
}
```

### 401 Unauthorized

```json
{
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Authentication required"
  }
}
```

### 403 Forbidden

```json
{
  "error": {
    "code": "FORBIDDEN",
    "message": "Insufficient permissions"
  }
}
```

### 404 Not Found

```json
{
  "error": {
    "code": "NOT_FOUND",
    "message": "Resource not found"
  }
}
```

### 429 Too Many Requests

```json
{
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Rate limit exceeded",
    "retry_after": 60
  }
}
```

### 500 Internal Server Error

```json
{
  "error": {
    "code": "INTERNAL_SERVER_ERROR",
    "message": "An unexpected error occurred"
  }
}
```

## Webhooks

SonicClout provides webhooks for real-time event notifications. To set up a webhook:

1. Register a webhook URL in your account settings
2. Select the events you want to receive
3. Implement an endpoint to receive the webhook events

### Event Types

- `content.created` - New content token created
- `vesting.milestone_reached` - Vesting milestone reached
- `trade.completed` - Trade transaction completed
- `bond.issued` - New bond issued
- `bond.redeemed` - Bond redeemed

### Example Webhook Payload

```json
{
  "id": "evt_12345",
  "type": "content.created",
  "created_at": "2023-08-22T15:30:00Z",
  "data": {
    "content_id": "content_67890",
    "name": "My New Content",
    "symbol": "MNC",
    "creator_address": "7Zb1...FbK2",
    "transaction_id": "4xT2...jK9z"
  }
}
``` 