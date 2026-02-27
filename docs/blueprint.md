# **App Name**: InstaFlow Bot

## Core Features:

- WhatsApp Chatbot Flow Management: Manages user interactions through WhatsApp, including service selection, quantity input, and capturing Instagram profile links. Utilizes Firestore for maintaining conversation state and user sessions based on WhatsApp user numbers.
- Automated Price Calculation: Calculates the total price for Instagram followers dynamically based on user-selected quantity, using the formula: `ceil((quantity / 1000) * 120)`.
- Dynamic Payment Link Generation: Generates secure and dynamic payment links (e.g., Razorpay, Cashfree, UPI) for the calculated amount, saving transaction initiation details and status in Firestore.
- Payment Gateway Webhook Handling: Processes payment success/failure webhooks from the payment gateway to automatically update order payment status in Firestore, ensuring seamless order fulfillment.
- SMM Panel API Integration: Automates the placement of SMM orders by integrating with an external SMM panel API, passing the user's quantity and Instagram profile URL, and storing the returned order ID in Firestore.
- Generative Confirmation & Error Messaging Tool: Uses a generative AI tool to craft personalized, clear, and empathetic WhatsApp messages for order confirmations, payment instructions, and various error scenarios (e.g., invalid input, payment failure, SMM API issues).

## Style Guidelines:

- Primary brand color: A deep, professional indigo blue (#2E2EB3), conveying trust and efficiency.
- Background color: A subtle and light off-white with a hint of blue (#E8E8F2), providing a clean and non-distracting canvas.
- Accent color: A vibrant sky blue (#45C4FA) for calls to action and important highlights, adding a modern and clear touch.
- Body and headline font: 'Inter' (sans-serif) for its modern, neutral, and highly readable characteristics, suitable for conveying information clearly in a chat-based interface.
- Utilize simple and intuitive emojis within WhatsApp messages to enhance clarity and user engagement for selections, confirmations, and alerts.
- Messages structured as clear, concise chat bubbles with essential information presented upfront to guide the user through each step of the automated flow efficiently.