import React from "react";
import dynamic from "next/dynamic";
import Head from "next/head";

const VideoCallComponent = dynamic(() => import("@/components/VideoCall/VideoCall"), {
  ssr: false,
});

const VideoCallPage = () => {
  return (
    <>
      <Head>
        <title>Video Call | YourTube</title>
        <meta name="description" content="Connect with your friends on YourTube Meet" />
      </Head>
      <VideoCallComponent />
    </>
  );
};

export default VideoCallPage;
