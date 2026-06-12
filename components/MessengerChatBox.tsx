"use client";

import { useEffect } from "react";

type MessengerChatBoxProps = {
  pageId?: string;
};

declare global {
  interface Window {
    fbAsyncInit?: () => void;
    FB?: {
      init: (options: {
        xfbml: boolean;
        version: string;
      }) => void;
      XFBML?: {
        parse: () => void;
      };
    };
  }
}

export default function MessengerChatBox({ pageId }: MessengerChatBoxProps) {
  useEffect(() => {
    if (!pageId) return;

    if (!document.getElementById("fb-root")) {
      const root = document.createElement("div");
      root.id = "fb-root";
      document.body.appendChild(root);
    }

    window.fbAsyncInit = function () {
      window.FB?.init({
        xfbml: true,
        version: "v20.0",
      });

      window.FB?.XFBML?.parse();
    };

    const existingScript = document.getElementById("facebook-jssdk");

    if (!existingScript) {
      const script = document.createElement("script");
      script.id = "facebook-jssdk";
      script.async = true;
      script.defer = true;

      // IMPORTANT: Do not add crossOrigin here
      script.src =
        "https://connect.facebook.net/en_US/sdk/xfbml.customerchat.js";

      document.body.appendChild(script);
    } else {
      window.FB?.XFBML?.parse();
    }
  }, [pageId]);

  if (!pageId) return null;

  return (
    <div
      className="fb-customerchat"
      data-attribution="biz_inbox"
      data-page_id={pageId}
      data-theme_color="#0084ff"
      data-logged_in_greeting="Hi! How can we help you with this listing?"
      data-logged_out_greeting="Hi! How can we help you with this listing?"
      data-greeting_dialog_display="show"
      data-greeting_dialog_delay="1"
    />
  );
}