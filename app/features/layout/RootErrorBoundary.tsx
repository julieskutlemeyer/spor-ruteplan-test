import { Box, Heading, Stack, Text } from "@vygruppen/spor-react";
import React from "react";
export type RootErrorBoundaryProps = {
  error: unknown;
};
export const RootErrorBoundary = ({ error }: RootErrorBoundaryProps) => {
  if (error instanceof Error) {
    if (process.env.NODE_ENV === "development") {
      console.error(error);

      return (
        <Box mx="10">
          <Stack>
            <Heading as="h1">There was an error</Heading>
            <pre>{JSON.stringify(error.message)}</pre>
            <Text>{JSON.stringify(error.stack)}</Text>
          </Stack>
        </Box>
      );
    }
    return (
      <Box>
        <Heading as="h1">
          <pre>{JSON.stringify(error.message)}</pre>
        </Heading>
        <Text>
          Ta kontakt med team-alternativ-transport@vy.no om feilen vedvarer.
        </Text>
      </Box>
    );
  }

  return (
    <Box>
      <Heading as="h1">Opps, her skjedde det en feil!</Heading>
      <Text>
        Ta kontakt med team-alternativ-transport@vy.no om feilen vedvarer.
      </Text>
    </Box>
  );
};