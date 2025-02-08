import { Provider } from "@/components/ui/provider";
import { default as TrpcProvider } from "@/components/provider";
import { Roboto } from "next/font/google";
import type { Metadata } from "next";
import { Flex, Theme } from "@chakra-ui/react";

export const metadata: Metadata = {
  title: "ChatGPT Clone",
  description: "ChatGPT Clone",
};

export const roboto = Roboto({
  variable: "--font-roboto",
  weight: ["400", "500", "700", "900"],
  style: ["normal", "italic"],
  subsets: ["latin"],
  display: "swap",
});

const fonts = [roboto].map((font) => font.variable).join(" ");

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={fonts} suppressHydrationWarning>
      <body>
        <TrpcProvider>
          <Provider>
            <Theme appearance="light">
              <Flex minH="100svh" fontFamily="roboto">
                {children}
              </Flex>
            </Theme>
          </Provider>
        </TrpcProvider>
      </body>
    </html>
  );
}
