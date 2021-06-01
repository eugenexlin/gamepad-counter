import { Box } from "@material-ui/core";
import * as React from "react";
import { DebugLand } from "../layouts/DebugLand";

// markup
const IndexPage = () => {
    return (
        <main>
            <title>gamepad viewer</title>
            <Box padding={2}>
                <DebugLand></DebugLand>
            </Box>
        </main>
    );
};

export default IndexPage;
