import React from "react";

const SubscriptionsPage = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] space-y-4">
      <div className="bg-secondary p-8 rounded-full">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor" className="text-muted-foreground">
          <path d="M18.7 8.7a1 1 0 00-1.4 0L12 14.0k9 4.7 8.7a1 1 0 00-1.4 1.4L11.3 16a1 1 0 001.4 0l6-6a1 1 0 000-1.4z" />
        </svg>
      </div>
      <h2 className="text-2xl font-bold">Don't miss a thing</h2>
      <p className="text-muted-foreground">Sign in to see updates from your favorite YouTube channels</p>
    </div>
  );
};

export default SubscriptionsPage;
