
# InstaFlow WhatsApp Bot - Setup Guide

This bot automates SMM orders directly via WhatsApp. To connect it to your specific phone number, follow these steps:

## 1. Setup Meta Developer App
1. Go to [Meta for Developers](https://developers.facebook.com/).
2. Create a new App (Type: Business).
3. Add the **WhatsApp** product to your app.

## 2. Get Credentials
1. In the WhatsApp "Getting Started" section, you will find your **Phone Number ID**.
2. Generate a **Permanent Access Token** (System User token) for your app.
3. Define a **Verify Token** (e.g., `instaflow_secret_token`).

## 3. Update Environment Variables
Add these to your `.env` file in Firebase Studio:
- `WHATSAPP_ACCESS_TOKEN`: Your permanent token.
- `WHATSAPP_PHONE_NUMBER_ID`: The ID from Meta.
- `WHATSAPP_VERIFY_TOKEN`: The secret string you chose.

## 4. Configure Webhook
1. In Meta Developer Portal, go to **WhatsApp > Configuration**.
2. Set Callback URL to: `https://[your-app-url]/api/whatsapp/webhook`
3. Set Verify Token to: `instaflow_secret_token`
4. **Important:** Under Webhook Fields, click Manage and **Subscribe** to `messages`.

## 5. Pricing Details (Updated)
- Instagram Followers: ₹87 / 1000
- Instagram Likes: ₹18 / 1000
- Instagram Views: ₹0.80 / 1000
- Instagram Shares: ₹7 / 1000
- Instagram Comments: ₹278 / 1000

The bot automatically calculates the price and generates a UPI QR code for **CHETAN KUMAR MEGHWAL** at **chetanmrbest-1@okicici**.
