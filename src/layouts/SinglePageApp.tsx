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
    Menu,
    MenuItem,
    Collapse,
} from "@material-ui/core";

import UsbIcon from "@material-ui/icons/Usb";
import CategoryIcon from "@material-ui/icons/Category";
import DashboardIcon from "@material-ui/icons/Dashboard";
import AssessmentIcon from "@material-ui/icons/Assessment";
import SettingsIcon from "@material-ui/icons/Settings";
import FolderSharedIcon from "@material-ui/icons/FolderShared";
import OpenInNewIcon from "@material-ui/icons/OpenInNew";
import { EasyInputFormat, HIDManager } from "../components/HIDManager";
import { DebugLand } from "../components/DebugLand";
import { AllTallyRenderer } from "../components/AllTallyRenderer";
import { ExpandLess, ExpandMore, StarBorder } from "@material-ui/icons";
import { TallySet } from "../models/DashboardModels";
import { TallySetLayout } from "../components/TallySetLayout";
import { INFINITAS_DP } from "../models/Presets";
import Popup, { PopupCenterTarget } from "../components/Popup";

const drawerWidth = 240;

// HID fires events outside react livecycle so it is faster than react lifecycle can handle
// this will let it increment properly
var rerenderCountOutsideReact = 0;

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        root: {
            display: "flex",
        },
        grow: {
            flexGrow: 1,
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
        nested: {
            paddingLeft: theme.spacing(4),
        },
        buttonActivate: {
            borderColor: "#FBB !important",
            color: "#ECC !important",
            transition: "none !important",
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

    const [isPresetsOpen, setIsPresetsOpen] = React.useState(true);

    // [joy index][button index]
    const [buttonTally, setButtonTally] = React.useState<number[][]>([]);
    const [axisIncreaseTally, setAxisIncreaseTally] = React.useState<
        number[][]
    >([]);
    const [axisDecreaseTally, setAxisDecreaseTally] = React.useState<
        number[][]
    >([]);

    const [rerenderKey, setRerenderKey] = React.useState<number>(
        rerenderCountOutsideReact,
    );
    const incrementRerenderKey = () => {
        rerenderCountOutsideReact = rerenderCountOutsideReact + 1;
        setRerenderKey(rerenderCountOutsideReact);
    };

    const classes = useStyles();
    const theme = useTheme();

    const handleDrawerToggle = () => {
        setMobileOpen(!mobileOpen);
    };

    const [inputReports, setInputReports] = React.useState<EasyInputFormat[]>(
        [],
    );

    // save button states because axis states are a lot more spammy
    const [buttonStates, setButtonStates] = React.useState<boolean[][]>([]);

    const [tallySet, setTallySet] = React.useState<TallySet>({});

    const [isPopupOpen, setIsPopupOpen] = React.useState(false);
    const [popupCounter, setPopupCounter] = React.useState(0);

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
    };

    const handleInputReport = (index: number, report: EasyInputFormat) => {
        if (currentPage === pages.DASHBOARD) {
            let newButtonStates = buttonStates.slice();
            newButtonStates[index] = report.button.slice();
            setButtonStates(newButtonStates)
        }
        if (currentPage === pages.CONNECT) {
            // init if not here
            if (buttonStates[index] === undefined) {
                let newButtonStates = buttonStates.slice();
                newButtonStates[index] = [];
                setButtonStates(newButtonStates)
            }

            let newInputReports = inputReports.slice();
            newInputReports[index] = report;
            setInputReports(newInputReports);

            ensureTallysExist(
                buttonTally,
                setButtonTally,
                index,
                report.button.length,
            );
            ensureTallysExist(
                axisIncreaseTally,
                setAxisIncreaseTally,
                index,
                report.axis.length,
            );
            ensureTallysExist(
                axisDecreaseTally,
                setAxisDecreaseTally,
                index,
                report.axis.length,
            );
        }
    };

    const handleButtonDown = (index: number, buttonIndex: number) => {
        incrementGeneric(index, buttonIndex, buttonTally);
    };

    const handleAxisStartIncreasing = (index: number, axisIndex: number) => {
        incrementGeneric(index, axisIndex, axisIncreaseTally);
    };
    const handleAxisStartDecreasing = (index: number, axisIndex: number) => {
        incrementGeneric(index, axisIndex, axisDecreaseTally);
    };

    const incrementGeneric = (
        index: number,
        subIndex: number,
        sourceArr: number[][],
    ) => {
        // this is not proper react state handling, but because of race condition,
        // i am going to modify array directly.
        if (sourceArr[index] == undefined) {
            sourceArr[index] = [];
        }
        if (sourceArr[index][subIndex] == undefined) {
            sourceArr[index][subIndex] = 0;
        }
        sourceArr[index][subIndex] += 1;
        // setArray(sourceArr);
        incrementRerenderKey();
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
                <ListItem
                    button
                    onClick={() => {
                        setIsPresetsOpen(!isPresetsOpen);
                    }}
                    key={"PRESETS_DRAWER_ITEM"}
                >
                    <ListItemIcon>
                        <FolderSharedIcon />
                    </ListItemIcon>
                    <ListItemText primary={"Presets"} />
                    {isPresetsOpen ? <ExpandLess /> : <ExpandMore />}
                </ListItem>

                <Collapse in={isPresetsOpen} timeout="auto" unmountOnExit>
                    <List component="div" disablePadding>
                        <ListItem
                            button
                            onClick={() => {
                                setCurrentPage(pages.DASHBOARD);
                                setTallySet(INFINITAS_DP);
                            }}
                            className={classes.nested}
                        >
                            <ListItemIcon>
                                <DashboardIcon />
                            </ListItemIcon>
                            <ListItemText primary="Infinitas DP" />
                        </ListItem>
                    </List>
                </Collapse>
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
                    <div className={classes.grow}></div>
                    <div>
                        <IconButton
                            aria-label="Pop Out"
                            color="inherit"
                            onClick={() => {
                                setIsPopupOpen(true);
                                setPopupCounter(popupCounter + 1);
                            }}
                        >
                            <OpenInNewIcon />
                        </IconButton>
                        <IconButton
                            aria-label="Global Settings"
                            color="inherit"
                        >
                            <SettingsIcon />
                        </IconButton>
                    </div>
                </Toolbar>
            </AppBar>
            <nav className={classes.drawer}>
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
                <HIDManager
                    IsRenderUI={currentPage === pages.CONNECT}
                    onInputReport={handleInputReport}
                    onDeviceRemoved={handleRemoveReport}
                    onButtonDown={handleButtonDown}
                    onAxisStartIncreasing={handleAxisStartIncreasing}
                    onAxisStartDecreasing={handleAxisStartDecreasing}
                ></HIDManager>
                {currentPage === pages.CONNECT && (
                    <DebugLand inputReports={inputReports} />
                )}
                {currentPage === pages.ALL_TALLY && (
                    <AllTallyRenderer
                        allButtons={buttonTally}
                        allAxisIncreases={axisIncreaseTally}
                        allAxisDecreases={axisDecreaseTally}
                        key={rerenderKey}
                    ></AllTallyRenderer>
                )}
                {currentPage === pages.DASHBOARD && (
                    <TallySetLayout
                        allButtons={buttonTally}
                        allAxisIncreases={axisIncreaseTally}
                        allAxisDecreases={axisDecreaseTally}
                        tallySet={tallySet}
                        inputReports={inputReports}
                        buttonStates={buttonStates}
                        useChangeEffect={true}
                        changeEffectClass={classes.buttonActivate}
                    ></TallySetLayout>
                )}
                {isPopupOpen && (
                    <Popup
                        specs={{ width: 622, height: 160 }}
                        centerOnTarget={PopupCenterTarget.Parent}
                        isOpenCounter={popupCounter}
                        title={"gamepad counter popup"}
                        name={"gampad-counter-popup"}
                        doNotClosePopupWithParent={false}
                        onUnload={() => {
                            setIsPopupOpen(false);
                        }}
                    >
                        <div
                            style={{
                                padding: "16px",
                                backgroundColor: "#F0F",
                                height: "100%",
                                width: "100%",
                            }}
                        >
                            <TallySetLayout
                                allButtons={buttonTally}
                                allAxisIncreases={axisIncreaseTally}
                                allAxisDecreases={axisDecreaseTally}
                                tallySet={tallySet}
                                inputReports={inputReports}
                                buttonStates={buttonStates}
                                useChangeEffect={true}
                                changeEffectClass={classes.buttonActivate}
                            ></TallySetLayout>
                        </div>
                    </Popup>
                )}
            </main>
        </div>
    );
};
