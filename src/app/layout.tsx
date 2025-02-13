import { default as TrpcProvider } from "@/components/provider";
import { Provider } from "@/components/ui/provider";
import { Flex, Theme } from "@chakra-ui/react";
import type { Metadata } from "next";
import { Roboto } from "next/font/google";

export const metadata: Metadata = {
  title: "OpenGPT",
  description: "ChatGPT Clone",
  icons: [
    {
      href: "/favicon.png",
      rel: "icon",
      url: "/favicon.png",
    },
  ]
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
            <Theme appearance="dark" bg="gray.800">
              <Flex fontFamily="roboto" color="white">
                {children}
              </Flex>
            </Theme>
          </Provider>
        </TrpcProvider>
      </body>
    </html>
  );
}
