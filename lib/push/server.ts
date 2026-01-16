import webpush from "web-push";

// Keys will be provided by Claude (Phase A)
// PUSH_VAPID_PUBLIC_KEY
// PUSH_VAPID_PRIVATE_KEY
// EMAIL_FROM (used for mailto: subject)

const vapidDetails = {
  subject: process.env.EMAIL_FROM 
    ? `mailto:${process.env.EMAIL_FROM.match(/<(.+)>/)?.[1] || process.env.EMAIL_FROM}` 
    : "mailto:support@example.com",
  publicKey: process.env.PUSH_VAPID_PUBLIC_KEY || "mock_public_key",
  privateKey: process.env.PUSH_VAPID_PRIVATE_KEY || "mock_private_key",
};

if (process.env.PUSH_VAPID_PUBLIC_KEY && process.env.PUSH_VAPID_PRIVATE_KEY) {
  webpush.setVapidDetails(
    vapidDetails.subject,
    vapidDetails.publicKey,
    vapidDetails.privateKey
  );
}

export async function sendPushNotification(
  subscription: webpush.PushSubscription,
  payload: string
) {
  try {
    await webpush.sendNotification(subscription, payload);
    return { success: true };
  } catch (error: unknown) {
    if (error instanceof Error && "statusCode" in error && error.statusCode === 410) {
      return { success: false, expired: true };
    }
    console.error("Push Error:", error);
    return { success: false, error };
  }
}
