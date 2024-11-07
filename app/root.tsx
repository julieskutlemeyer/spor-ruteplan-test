import {
  Links,
  Meta,
  Outlet,
  Scripts,
} from "@remix-run/react";
import { ReactNode, useContext, useEffect, useRef } from "react";
import { MetaFunction, LoaderFunctionArgs, json } from "@remix-run/node";
import { withEmotionCache } from "@emotion/react";
import { Brand, Language, SporProvider } from "@vygruppen/spor-react";
import i18next from "./features/language/i18next.server";
import React from "react";
import ClientStyleContext from "./features/styles/client.context";
import ServerStyleContext from "./features/styles/server.context";

export const meta: MetaFunction = () => [
  {
    charset: "utf-8",
    title: "alternative-transport-location-frontend",
    viewport: "width=device-width,initial-scale=1",
  },
];

export const handle = {
  i18n: "common",
};

interface DocumentProps {
  children: React.ReactNode;
  title?: string;
}

interface DocumentProps {
  children: ReactNode;
  title?: string;
}

const Document = withEmotionCache(
  ({ children, title }: DocumentProps, emotionCache) => {
    const serverStyleData = useContext(ServerStyleContext);
    const clientStyleData = useContext(ClientStyleContext);
    const reinjectStylesRef = useRef(true);

    

    // Only executed on client
    // When a top level ErrorBoundary or CatchBoundary are rendered,
    // the document head gets removed, so we have to create the style tags
    useEffect(() => {
      if (!reinjectStylesRef.current) {
        return;
      }
      // re-link sheet container
      emotionCache.sheet.container = document.head;

      // re-inject tags
      const tags = emotionCache.sheet.tags;
      emotionCache.sheet.flush();
      tags.forEach((tag) => {
        /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
        (emotionCache.sheet as any)._insertTag(tag);
      });

      // reset cache to re-apply global styles
      clientStyleData.reset();
      // ensure we only do this once per mount
      reinjectStylesRef.current = false;
    }, [clientStyleData, emotionCache.sheet]);

    return (
      <html lang={"nb"}>
        <head>
          <title>Hello</title> 
          <Meta />
          <Links />
          {serverStyleData?.map(({ key, ids, css }) => (
            <style
              key={key}
              data-emotion={`${key} ${ids.join(" ")}`}
              // eslint-disable-next-line react/no-danger
              dangerouslySetInnerHTML={{ __html: css }}
            />
          ))}
        </head>
        <body>
          {children}
          <Scripts />
        </body>
      </html>
    );
  },
);

export default function App() {
  return (
    <Document>
      <SporProvider
        brand={Brand.VyUtvikling}
        language={Language.NorwegianBokmal}
      >
        <Outlet />
      </SporProvider>
    </Document>
  );
}