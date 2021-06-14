import React from "react";
import _ from "lodash";
import {
    Theme,
    useTheme,
    createStyles,
    makeStyles,
} from "@material-ui/core/styles";
import CssBaseline from "@material-ui/core/CssBaseline";
import {
    AppBar,
    Box,
    Divider,
    Drawer,
    Hidden,
    IconButton,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    Toolbar,
    Typography,
} from "@material-ui/core";

import UsbIcon from "@material-ui/icons/Usb";
import CategoryIcon from "@material-ui/icons/Category";
import DashboardIcon from "@material-ui/icons/Dashboard";
import AssessmentIcon from "@material-ui/icons/Assessment";
import { EasyInputFormat, HIDManager } from "../components/HIDManager";
import { DebugLand } from "../components/DebugLand";
import { AllTallyRenderer } from "../components/AllTallyRenderer";

const drawerWidth = 240;

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        root: {
            display: "flex",
        },
        drawer: {
            [theme.breakpoints.up("sm")]: {
                width: drawerWidth,
                flexShrink: 0,
            },
        },
        appBar: {
            [theme.breakpoints.up("sm")]: {
                width: `calc(100% - ${drawerWidth}px)`,
                marginLeft: drawerWidth,
            },
        },
        menuButton: {
            marginRight: theme.spacing(2),
            [theme.breakpoints.up("sm")]: {
                display: "none",
            },
        },
        // necessary for content to be below app bar
        toolbar: theme.mixins.toolbar,
        title: {
            display: "flex",
            alignItems: "center",
            paddingLeft: "24px",
        },
        drawerPaper: {
            width: drawerWidth,
        },
        content: {
            flexGrow: 1,
            padding: theme.spacing(3),
        },
    }),
);

enum pages {
    CONNECT = 0,
    ALL_TALLY = 2,
    DASHBOARD = 1,
}
const mapPageToTitle = (page: pages) => {
    switch (page) {
        case pages.CONNECT:
            return "Connect Device";
        case pages.ALL_TALLY:
            return "Test Buttons";
        case pages.DASHBOARD:
            return "Dashboards";
        default:
            return "You have entered the abyss.";
    }
};
const mapPageToIcon = (page: pages) => {
    switch (page) {
        case pages.CONNECT:
            return <UsbIcon />;
        case pages.ALL_TALLY:
            return <AssessmentIcon />;
        case pages.DASHBOARD:
            return <DashboardIcon />;
        default:
            return <CategoryIcon />;
    }
};

export const SinglePageApp = () => {
    const [mobileOpen, setMobileOpen] = React.useState(false);

    const [currentPage, setCurrentPage] = React.useState<pages>(pages.CONNECT);

    // [joy index][button index]
    const [buttonTally, setButtonTally] = React.useState<number[][]>([]);
    const [axisIncreaseTally, setAxisIncreaseTally] = React.useState<
        number[][]
    >([]);
    const [axisDecreaseTally, setAxisDecreaseTally] = React.useState<
        number[][]
    >([]);

    const classes = useStyles();
    const theme = useTheme();

    const handleDrawerToggle = () => {
        setMobileOpen(!mobileOpen);
    };

    const [inputReports, setInputReports] = React.useState<EasyInputFormat[]>(
        [],
    );

    const handleRemoveReport = (index: number) => {
        if (index >= 0 && inputReports.length > index) {
            const array = [...inputReports];
            array.splice(index, 1);
            setInputReports(array);
        }
    };

    const ensureTallysExist = (arr, setArr, index, count) => {
        if (arr[index] == undefined) {
            let nextTally = _.cloneDeep(arr);
            nextTally[index] = Array(count).fill(0);
            setArr(nextTally);
        }
    }

    const handleInputReport = (index: number, report: EasyInputFormat) => {
        if (currentPage !== pages.CONNECT) {
            return;
        }
        let newInputReports = inputReports.slice();
        newInputReports[index] = report;
        setInputReports(newInputReports);

        ensureTallysExist(buttonTally, setButtonTally, index, report.button.length);
        ensureTallysExist(axisIncreaseTally, setAxisIncreaseTally, index, report.axis.length);
        ensureTallysExist(axisDecreaseTally, setAxisDecreaseTally, index, report.axis.length);
    };

    const handleButtonDown = (index: number, buttonIndex: number) => {
        incrementGeneric(index, buttonIndex, buttonTally, setButtonTally);
    };

    const handleAxisStartIncreasing = (index: number, axisIndex: number) => {
        incrementGeneric(
            index,
            axisIndex,
            axisIncreaseTally,
            setAxisIncreaseTally,
        );
    };
    const handleAxisStartDecreasing = (index: number, axisIndex: number) => {
        incrementGeneric(
            index,
            axisIndex,
            axisDecreaseTally,
            setAxisDecreaseTally,
        );
    };

    const incrementGeneric = (
        index: number,
        subIndex: number,
        sourceArr: number[][],
        setArray: any,
    ) => {
        let nextTally = [...sourceArr];
        if (nextTally[index] == undefined) {
            nextTally[index] = [];
        }
        let nextSubTally = [...nextTally[index]]
        nextTally[index] = nextSubTally
        if (nextTally[index][subIndex] == undefined) {
            nextTally[index][subIndex] = 0;
        }
        nextTally[index][subIndex] += 1;
        setArray(nextTally);
    };

    const drawer = (
        <div>
            <div className={classes.toolbar + " " + classes.title}>
                <Typography variant="h6" noWrap>
                    Gamepad Counter
                </Typography>
            </div>
            <Divider />
            <List>
                {[pages.CONNECT, pages.ALL_TALLY, pages.DASHBOARD].map(
                    (page) => (
                        <ListItem
                            button
                            onClick={() => {
                                setCurrentPage(page);
                            }}
                            selected={currentPage === page}
                            key={page}
                        >
                            <ListItemIcon>{mapPageToIcon(page)}</ListItemIcon>
                            <ListItemText primary={mapPageToTitle(page)} />
                        </ListItem>
                    ),
                )}
            </List>
        </div>
    );

    return (
        <div className={classes.root}>
            <CssBaseline />
            <AppBar position="fixed" className={classes.appBar}>
                <Toolbar>
                    <IconButton
                        color="inherit"
                        aria-label="open drawer"
                        edge="start"
                        onClick={handleDrawerToggle}
                        className={classes.menuButton}
                    >
                        {/* <MenuIcon /> */}
                    </IconButton>
                    <Typography variant="h6" noWrap>
                        {mapPageToTitle(currentPage)}
                    </Typography>
                </Toolbar>
            </AppBar>
            <nav className={classes.drawer} aria-label="mailbox folders">
                {/* The implementation can be swapped with js to avoid SEO duplication of links. */}
                <Hidden smUp implementation="css">
                    <Drawer
                        variant="temporary"
                        anchor={theme.direction === "rtl" ? "right" : "left"}
                        open={mobileOpen}
                        onClose={handleDrawerToggle}
                        classes={{
                            paper: classes.drawerPaper,
                        }}
                        ModalProps={{
                            keepMounted: true, // Better open performance on mobile.
                        }}
                    >
                        {drawer}
                    </Drawer>
                </Hidden>
                <Hidden xsDown implementation="css">
                    <Drawer
                        classes={{
                            paper: classes.drawerPaper,
                        }}
                        variant="permanent"
                        open
                    >
                        {drawer}
                    </Drawer>
                </Hidden>
            </nav>
            <main className={classes.content}>
                <div className={classes.toolbar} />
                <Box marginBottom={"24px"}>
                    <HIDManager
                        IsRenderUI={currentPage === pages.CONNECT}
                        onInputReport={handleInputReport}
                        onDeviceRemoved={handleRemoveReport}
                        onButtonDown={handleButtonDown}
                        onAxisStartIncreasing={handleAxisStartIncreasing}
                        onAxisStartDecreasing={handleAxisStartDecreasing}
                    ></HIDManager>
                </Box>
                {currentPage === pages.CONNECT && (
                    <DebugLand inputReports={inputReports} />
                )}
                {currentPage === pages.ALL_TALLY && (
                    <>
                        <AllTallyRenderer
                            allButtons={buttonTally}
                            allAxisIncreases={axisIncreaseTally}
                            allAxisDecreases={axisDecreaseTally}
                        ></AllTallyRenderer>
                    </>
                )}
            </main>
        </div>
    );
};
