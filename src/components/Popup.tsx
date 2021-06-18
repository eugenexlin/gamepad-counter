import * as React from "react";
import * as ReactDOM from "react-dom";

export interface PopupProps {
    url?: string;
    title?: string;
    name?: string;
    specs: PopupSpecs;

    /*
		this will override PopupSpecs left and top.
	*/
    centerOnTarget: PopupCenterTarget | undefined;

    /*
		this will attempt to make the popup page inherit the styles of the parent page.
		default = copy styles if url is blank
	*/
    shouldCopyStyleSheets?: boolean;

    /*
		when enabled, the popup will persist after parent is unloaded
	 */
    doNotClosePopupWithParent?: boolean;

    /*
		for setting the content of the popup manually so that it is not tracked by React
		and therefore not cleaned up when popup is unloaded. Should be used with
		doNotClosePopupWithParent
	*/
    forcedBodyHTMLContent?: string;

    onUnload?: () => any;

    prePopupOpen?: () => void;

    postMessageHandler?: (e: MessageEvent) => void;

    // use this as a flag to determine if it should force close and open popup.
    // useful for when they dont close popup, and it is in the background
    // and you want to send it to the front of screen.
    // start at 1 and increment
    isOpenCounter?: number;
}

interface PopupState {
    mounted: boolean;
    isOpenCounter?: number;
    needsReopen: boolean;
}

export interface PopupSpecs {
    // show menu bar
    menubar?: boolean;
    // show status bar
    status?: boolean;
    top?: number;
    left?: number;
    width: number;
    height: number;
}

export enum PopupCenterTarget {
    None = "N",
    Parent = "P",
    Screen = "S",
}

class Popup extends React.PureComponent<PopupProps, PopupState> {
    constructor(props: PopupProps) {
        super(props);
        this.state = {
            isOpenCounter: props.isOpenCounter,
            needsReopen: false,
            mounted: false,
        };
    }

    private container = document.createElement("body");
    private popup: Window | null = null;
    private released: boolean = false;
    private intervalHandle: number | undefined = undefined;

    isURLEmpty = (): boolean => !this.props.url || this.props.url === "";

    render() {
        if (!this.state.mounted) {
            return null;
        }
        // this spends 1 frame rendering nothing, so the next time the popup opens,
        // it will redo all the JSX refs that might be necessary.
        if (this.state.needsReopen) {
            return null;
        }

        let childrenProp: React.ReactNode[] = [];

        if (this.props.children) {
            childrenProp = React.Children.toArray(this.props.children);
        }

        return ReactDOM.createPortal(childrenProp, this.container);
    }

    componentDidUpdate(prevProps: PopupProps) {
        // if setting the forcedBodyHTMLContent don't bother with any of the open counter or
        // needs reopen logic because the popup is intended to just exist on its own at that point
        if (
            this.popup &&
            this.props.forcedBodyHTMLContent !== undefined &&
            this.props.forcedBodyHTMLContent !== ""
        ) {
            this.popup.document.body.innerHTML =
                this.props.forcedBodyHTMLContent;
            return;
        }

        if (this.props.isOpenCounter) {
            let needsReopen: boolean = false;
            if (this.state.isOpenCounter) {
                // first time open
                if (this.state.isOpenCounter !== this.props.isOpenCounter) {
                    // different counter. re open popup.
                    if (this.popup) {
                        // ensure the close event does not get called
                        this.removeAllEventListeners();
                        // then close it
                        this.tryClosePopup();
                        // make a new body
                        this.container = document.createElement("body");
                    }
                    needsReopen = true;
                }
            } else {
                // do nothing special
            }
            this.setState({
                isOpenCounter: this.props.isOpenCounter,
                needsReopen: this.state.needsReopen || needsReopen,
            });
        }

        if (this.state.needsReopen) {
            this.openPopup();
            this.setState({ needsReopen: false });
        }

        // If url changes, change popup to new url
        // Just changing window.href removes popup from grasp of react
        if (
            this.popup !== null &&
            !this.popup.closed &&
            prevProps.url !== this.props.url &&
            this.props.url !== undefined
        ) {
            this.removeAllEventListeners();

            this.tryClosePopup();
            this.container = document.createElement("body");

            this.setState({ needsReopen: true });
        }
    }

    removeAllEventListeners = () => {
        if (this.props.postMessageHandler) {
            window.removeEventListener(
                "message",
                this.props.postMessageHandler,
            );
        }

        if (this.intervalHandle !== undefined) {
            window.clearInterval(this.intervalHandle);
        }

        try {
            if (this.popup !== null && this.popup.removeEventListener) {
                this.popup.removeEventListener(
                    "beforeunload",
                    this.handlePopupClose,
                );
            }
        } catch (ex) {
            // Throws exception if popup is in a different origin than parent.
            // Also popups that get redirected, lose their event listeners already.
        }
    };

    componentDidMount() {
        // this.container.addEventListener('keydown', this.handleKeyDown);

        if (this.props.prePopupOpen) {
            this.props.prePopupOpen();
        }

        this.openPopup();
        this.setState({ mounted: true });
    }

    handlePopupToExternalSiteClosed = () => {
        if (this.popup !== null && this.popup.closed) {
            this.handlePopupClose();
        }
    };

    componentWillUnmount() {
        this.removeAllEventListeners();
        this.tryClosePopup();
    }

    // TODO
    // i think there is a problem with stopPropogation when we have react portals into popups
    // the event doesnt seem to stop
    // and the popup just always closes on escape.
    // going to remove it for now. PLEASE FIX LATER
    // handleKeyDown = (e: any) => {
    // 	if (e.keyCode === 27) {
    // 		// key down
    // 		if (this.state.mounted) {
    // 			if (this.props.onUnload) {
    // 				this.props.onUnload();
    // 			}
    // 			e.stopPropagation();
    // 		}
    // 	}
    // };

    openPopup = () => {
        let specs: PopupSpecs = Object.assign({}, this.props.specs);

        if (this.props.centerOnTarget !== undefined) {
            switch (this.props.centerOnTarget) {
                case PopupCenterTarget.Parent:
                    // our version of react does not seem to have AVAIL left top
                    let parentX = window.screenLeft
                        ? window.screenLeft
                        : window.screenX;
                    let parentY = window.screenTop
                        ? window.screenTop
                        : window.screenY;

                    const parentWidth = window.top.outerWidth
                        ? window.top.outerWidth
                        : window.outerWidth
                        ? window.outerWidth
                        : document.documentElement.clientWidth;
                    const parentHeight = window.top.outerHeight
                        ? window.top.outerHeight
                        : window.outerHeight
                        ? window.outerHeight
                        : document.documentElement.clientHeight;

                    specs.left = parentX + parentWidth / 2 - specs.width / 2;
                    specs.top = parentY + parentHeight / 2 - specs.height / 2;
                    break;

                case PopupCenterTarget.Screen:
                    // browser standard is crazy, and we will do a bunch of fallback variable.

                    // our version of react does not seem to have AVAIL left top
                    const currentMonitorOriginX =
                        (window.screen as any).availLeft !== undefined
                            ? (window.screen as any).availLeft
                            : window.screenLeft
                            ? window.screenLeft
                            : window.screenX;
                    const currentMonitorOriginY =
                        (window.screen as any).availTop !== undefined
                            ? (window.screen as any).availTop
                            : window.screenTop
                            ? window.screenTop
                            : window.screenY;

                    const width = window.screen.width
                        ? window.screen.width
                        : window.innerWidth
                        ? window.innerWidth
                        : document.documentElement.clientWidth;
                    const height = window.screen.height
                        ? window.screen.height
                        : window.innerHeight
                        ? window.innerHeight
                        : document.documentElement.clientHeight;

                    specs.left =
                        width / 2 - specs.width / 2 + currentMonitorOriginX;
                    specs.top =
                        height / 2 - specs.height / 2 + currentMonitorOriginY;
                    break;

                case PopupCenterTarget.None:
                default:
                    break;
            }
        }

        this.popup = window.open(
            this.getUrl(),
            this.getName(),
            this.convertToSpecsString(specs),
        );

        if (this.popup) {
            this.popup.focus();
            this.popup.document.title = this.getTitle();

            if (
                !this.props.url &&
                (this.props.children ||
                    this.props.forcedBodyHTMLContent !== undefined)
            ) {
                this.popup.document.body = this.container;
                this.container.style.height = "100%";
                this.container.style.width = "100%";
                if (this.shouldCopyStyleSheets()) {
                    this.copyStyleSheets(window.document, this.popup.document);
                }
            }

            // Release anything bound to this component before the new window unload.
            this.popup.addEventListener("beforeunload", this.handlePopupClose);

            // If we are opening a new popup with the url provided, keep track of its close
            if (!this.isURLEmpty()) {
                this.intervalHandle = window.setInterval(
                    this.handlePopupToExternalSiteClosed,
                    100,
                );
            }

            if (this.props.postMessageHandler) {
                window.addEventListener(
                    "message",
                    this.props.postMessageHandler,
                );
            }
        }
    };

    tryClosePopup = () => {
        if (
            this.popup &&
            !this.popup.closed &&
            !this.props.doNotClosePopupWithParent
        ) {
            this.popup.close();
            this.popup = null;
        }
    };

    handlePopupClose = () => {
        // Do not trigger popup clean up prematurely when popup posts back.
        if (!this.isURLEmpty() && this.popup !== null && !this.popup.closed) {
            return;
        }

        if (this.released) {
            return;
        }
        this.released = true;

        if (this.props.onUnload) {
            this.props.onUnload();
        }
    };

    getUrl = () => {
        return this.props.url ? this.props.url : "about:blank";
    };
    getTitle = () => {
        return this.props.title ? this.props.title : window.document.title;
    };
    getName = () => {
        // For parsing url hostname easily
        let popupURL: HTMLAnchorElement = document.createElement("a");
        popupURL.href = this.getUrl();

        // Don't return a name if the popup is not to the same origin. It will violate the same origin
        // policy if a name is set and the popup component tries to reuse the popup instead of generating
        // a new popup
        if (popupURL.hostname !== window.location.hostname) {
            return "";
        }
        return this.props.name ? this.props.name : "";
    };
    shouldCopyStyleSheets = () => {
        if (this.props.shouldCopyStyleSheets !== undefined) {
            return this.props.shouldCopyStyleSheets;
        }
        if (this.props.url) {
            // if has a url,a ssume it has its own stylesheets
            return false;
        } else {
            // copy styles by default if it is a blank url.
            return true;
        }
    };

    copyStyleSheets = (source: Document, target: Document) => {
        for (var i = 0; i < source.styleSheets.length; i++) {
            let styleSheet: StyleSheet = source.styleSheets[i];
            let cssRules: CSSRuleList;
            try {
                cssRules = (styleSheet as any).cssRules;
            } catch (ex) {
                // dont spam the console
                // console.warn(ex);
                continue;
            }

            if (cssRules) {
                const newStyleEl = source.createElement("style");

                for (var j = 0; j < cssRules.length; j++) {
                    let cssRule: CSSRule = cssRules[j];
                    newStyleEl.appendChild(
                        source.createTextNode(cssRule.cssText),
                    );
                }
                target.head.appendChild(newStyleEl);
            } else if (styleSheet.href) {
                const newLinkEl = source.createElement("link");
                newLinkEl.rel = "stylesheet";
                newLinkEl.href = styleSheet.href;
                target.head.appendChild(newLinkEl);
            }
        }
    };

    convertToSpecsString = (specs: PopupSpecs) => {
        return Object.keys(specs)
            .map((name) => {
                const value = specs[name];
                if (typeof value === "boolean") {
                    return `${name}=${value ? "yes" : "no"}`;
                } else {
                    return `${name}=${value}`;
                }
            })
            .join(",");
    };

    getDocument = () => {
        return this.popup.document;
    }
}

export default Popup;
