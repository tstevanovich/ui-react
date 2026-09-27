import type React from 'react';
import type { ActionFunction, LoaderFunction } from 'react-router-dom';

export interface FooterConfig {
    /**
     * Changes the mode of the Orchestra React application footer
     * @summary
     * "default" provides the option for users to have links display above the copyright
     * in the footer.  If mode is not provided in the footer configuration default mode will be used.
     *
     * "minimum" is a condensed, one line footer with no copyright.  you can provide both left and
     * right side links as.
     *
     * "maximum" provides the ability to leverage the props for "socialMedia", "beforeDisclaimer", and
     * "afterDisclaimer".  The disclaimer will always show in maximum mode.
     *
     * "hidden" completely hides the footer.
     * @default 'default'
     */
    mode?: 'default' | 'minimum' | 'maximum' | 'hidden';
    /**
     * Application version displayed in the footer (if provided)
     */
    version?: string;
    /**
     * Defines whether the footer should stick to the bottom of the page.
     * @default false
     */
    sticky?: boolean;
    /**
     * A list of NavItem objects (same object that is used for the Header navigation links) that
     * provide links in the footer.
     *
     * In the "minimize" mode, the linksPrimary will display on the left side near the
     * "All Rights Reserved" text.
     */
    linksPrimary?: NavItem[];
    /**
     * A list of NavItem objects (same object that is used for the Header navigation links) that
     * provide links in the footer.
     *
     * In the "minimize" mode, the linksSecondary will display on the right side near the security
     * link.
     */
    linksSecondary?: NavItem[];
    /**
     * Only available if mode = "maximize"
     *
     * A list of NavItem objects (filled out similar to the Header Actions) that allow you to specify
     * icon link buttons in your footer.  Ideally, to be brand standard, you would specify your social
     * media icons here (Facebook, Instagram, LinkedIn, etc.) - see the React Documentation Story for
     * this for more detail.
     */
    socialMedia?: NavItem[];
    /**
     * Only available if mode = "maximize"
     *
     * Allows application to provide a ReactNode of custom text before the disclaimer box.
     */
    beforeDisclaimer?: React.ReactNode;
    /**
     * Only available if mode = "maximize"
     *
     * Allows application to provide a ReactNode of custom text after the disclaimer box.
     */
    afterDisclaimer?: React.ReactNode;
    /**
     * Gives the application to override the default All Rights Reserved text with something custom.
     * This will display near the copyright (for default and maximum mode) or by itself
     * (in minimize mode) on the left hand side of the footer.
     * @default "Wells Fargo Bank, N.A. All Rights Reserved"
     */
    allRightsReserved?: string;
}

export interface NavItem {
    /**
     * Unique key for the nav item.
     * @default value of path
     */
    key?: string;
    /**
     * Path for the nav item. Required if no value for onClick is provided.
     * @example '/rates'
     */
    path?: string;
    /**
     * Text label for the nav item.
     * @example 'Rates'
     */
    label: string;
    /**
     * Optional icon for the nav item.
     * @see https://mui.com/components/material-icons/
     */
    icon?: React.ReactNode;
    /**
     * Optional badge count shown with icon-based nav items.
     */
    badgeCount?: number;
    /**
     * Optional list of permissions required for the nav item to be visible.
     */
    permissions?: string[];
    /**
     * Optional list of child NavItem objects.
     */
    navItems?: NavItem[];
    /**
     * Denotes whether to open the nav item in a new tab.
     * @default false
     */
    newTab?: boolean;
    /**
     * Denotes whether to open the nav item in a new window.
     * @default false
     */
    external?: boolean;
    /**
     * Optional component to provide wrapper around the nav item.
     */
    wrapper?: React.ComponentType<any>;
    /**
     * Props provided to the wrapper component
     */
    wrapperProps?: Record<string, unknown>;
    /**
     * Optional function to execute when the nav item is clicked.
     * Required if no value for path is provided.
     */
    onClick?: () => void;
}

export interface HeaderConfig {
    /**
     * Changes the mode of the Orchestra React application header
     * @summary
     * "default" displays the header.
     *
     * "hidden" completely hides the header.
     * @default 'default'
     */
    mode?: 'default' | 'hidden';
    /**
     * Displayed in the Application Header to right of the Wells Fargo logo
     */
    appName?: React.ReactNode;
    /**
     * If true, the Wells Fargo logo will be hidden from the header.
     * @default false
     */
    hideLogo?: boolean;
    /**
     * The primary navigation list. Displayed below the Header bar on the
     * left side of the UI (in desktop mode).
     */
    navPrimary?: NavItem[];
    /**
     * The secondary navigation list. Displayed below the Header bar on the
     * right side of the UI (in desktop mode).
     */
    navSecondary?: NavItem[];
    /**
     * A navigation list that displays to the left of the user icon in the header (in desktop mode).
     */
    actions?: NavItem[];
    /**
     * User-related navigation items that display in the User menu above 'Logout'.
     */
    userMenuNav?: NavItem[];
    /**
     * Defines whether the header should stick to the top of the page.
     * @default true
     */
    sticky?: boolean;
    /**
     * By default, the "Wells Fargo" logo in the header does not have a link tied to it.
     * By specifying your logoLink, the logo then becomes a navigation link to whatever
     * path you specify.
     * @example
     * logoLink: "/" → will take you to your home page.
     */
    logoLink?: string;
    /**
     * Position of the navigation in the Orchestra React template.
     * @default 'top'
     */
    navPosition?: 'top' | 'left';
    /**
     * When true navigation will be toggled to show when first entering the app or on any browser
     * refresh.
     * @default false
     */
    navOpen?: boolean;
    /**
     * When choosing foldable=true, the application will fold the left navigation to a width the size
     * of the icons used in your left navigation.  If you choose not to use icons, then the label will
     * be cut short (example: 'Dashboard' might say D...).
     * You also have an option to lock the foldable navigation if you so choose with the lock icon at
     * the bottom of the left navigation.
     * @default false
     */
    foldable?: boolean;
    /**
     * When choosing locked=true, the application will lock the left navigation to the full allowed
     * width of the navigation (same size as using the navPosition='left' without the foldable
     * option).
     * You still have the option to unlock it with the lock icon at the bottom of the left navigation.
     * @default false
     */
    locked?: boolean;
    /**
     * By default, the Profile option is available under the user menu. When you click this profile,
     * it displays user profile information like name, email, phone number, etc. It also shows
     * roles and entitlements.
     *
     * You have the option to override the framework-provided profile with your own by setting
     * userProfile to false. This will hide the framework Profile. You can provide your own Profile
     * in userMenuNav.
     * @default true
     */
    userProfile?: boolean;
    /**
     * By default, a welcome message will be displayed in the header when the user is logged in. You
     * can optionally hide this welcome message with this property.
     * @default false
     */
    showWelcomeMessage?: boolean;
}

export interface TemplateRoute {
    /**
     * The name of the route. Must be unique.
     * @example 'rates'
     */
    name: string;
    /**
     * The path for the route.
     * @example '/rates'
     */
    path: string;
    /**
     * The React component that should be rendered when the url matches the route path
     * @example <MyRatesComponent />
     */
    element: React.ReactNode;
    /**
     * A list of permissions required to enable the route
     * @example
     * ['rates.view', 'rates.edit']
     */
    permissions?: string[];
    /**
     * Optional data to be passed along to the route component.
     */
    data?: any;
    /**
     * Sets the page title. If not provided, the app name will be used.
     * @example 'Rates'
     */
    title?: string;
    /**
     * Defines a LoaderFunction to be used with the route
     * @see https://reactrouter.com/en/main/route/loader
     */
    loader?: LoaderFunction;
    /**
     * Defines an ActionFunction to be used with the route
     * @see https://reactrouter.com/en/main/route/action
     */
    action?: ActionFunction;
    /**
     * Specify that the route does not require authentication.
     * Ignored if no auth configuration is provided.
     * @default false
     */
    noAuthRequired?: boolean;
}

export interface ServerConfig {
    /**
     * Server endpoint for logging
     * @example logToSplunk
     * @default clientlogs
     */
    serverLogEndpoint?: string;
    /**
     * Server url for logging
     * @example https://logger-microservice.wellsfargo.net/api/logToSplunk
     * @default Browser url
     */
    serverUrl?: string;
    /**
     * Sends default required headers for Orchestra micro service if true
     * @default false
     */
    endPointIsOrchestraMicroService?: boolean;
}

export interface LoggerConfig {
    /**
     * Defines the log level
     * @example
     * 0 - All
     * 1 - Debug
     * 2 - Info
     * 3 - Warn
     * 4 - Error
     * 5 - Fatal
     * 6 - Off
     * @default 4
     */
    uiLogLevel?: number;
    /**
     * Send logs to configured server end point if "true".
     * You must provide server configuration if this is set to true.
     * @default false
     */
    uiLogToServer?: boolean;
    /**
     * Send logs to browser console if "true".
     * @default false
     */
    uiLogToConsole?: boolean;
    /**
     * Framework sends logs to following configured endpoint if uiLogToServer=true.
     */
    server?: ServerConfig;
}

export interface ApplicationConfig {
    /**
     * Unique identifier for the application as specified in AppOne.
     * @example 'EBSSH'
     */
    appId: string;
    /**
     * Name of the application as specified in AppOne.
     * @example 'Enterprise Business Standards Shared Libraries and Frameworks'
     */
    appName: string;
    /**
     * Name of this unique component within the application.
     */
    componentName: string;
    /**
     * Short description of the application component.
     */
    description: string;
        /**
     * Version of the application component.
     */
    version: string;
    /**
     * App Component Identification Number
     * System of Record (SOR) key referencing the Application.
     *
     * @see https://confluence.wellsfargo.net/pages/viewpage.action?spaceKey=OR&title=App+Component+Service
     */
    acin?: string;
    /**
     * Component Identification Number
     * System of Record (SOR) key referencing the Component.
     *
     * @see https://confluence.wellsfargo.net/pages/viewpage.action?spaceKey=OR&title=App+Component+Service
     */
    cin?: string;
}

export interface SessionTimeoutConfig {
    /**
     * Idle value in seconds.
     * @default 600 seconds (10 minutes)
     */
    warnAfter?: number;
    /**
     * Timeout value in seconds.
     * @default 900 seconds (15 minutes)
     */
    redirAfter?: number;
    /**
     * Maximum active session duration in seconds.
     * @default 43200 seconds (12 hours)
     */
    maxActiveSession?: number;
    /**
     * Warn before logout after Maximum session time is elapsed.
     * @default 300 seconds (5 minutes)
     */
    warnBeforeMaxSessionTimeout?: number;
    /**
     * Time to check for user idle time in seconds.
     * @default 1 second
     */
    userIdlePing?: number;
    /**
     * Time to check for Maximum active session in seconds.
     * @default 60 seconds (1 minute)
     */
    maxActiveSessionPing?: number;
    /**
     * Time to check for refreshing token in seconds.
     * @default 30 seconds
     */
    refreshTokenPing?: number;
    /**
     * Token refresh time in seconds. Token is refreshed **2 mins** before expiry.
     *
     * **A minimum of `150 seconds` is required for token refresh. If the token
     * refresh time is less than 150 seconds then it will be set to 3599 seconds (59.9 mins).**
     *
     * @default
     * Default to authentication provider expiry time.
     * If it's not available then it defaults to 3599 seconds (59.9 mins).
     *
     * @deprecated
     * This function will be removed in the next version.
     * Use `tokenRefreshTime` in auth configuration instead.
     */
    tokenRefreshTime?: number;
    /**
     * Disables Session Timeout feature.
     * @default false
     */
    disableSessionTimeout?: boolean;
    /**
     * Enables idle session warning in document.title.
     * @default true
     */
    warnTitleEnabled?: boolean;
    /**
     * Idle session warning text to display in document.title.
     * @default 'Session Expiring!'
     */
    warnTitleText?: string;
    /**
     * Interval for displaying idle session warning text in document.title in milliseconds
     * @default 1000 milliseconds (1 second)
     */
    warnTitleInterval?: number;
}

export interface TemplateConfig {
    app: ApplicationConfig;
    header: HeaderConfig;
    footer: FooterConfig;
    routes?: TemplateRoute[];
    theme:
        | 'advisors'
        | 'consumer'
        | 'premier'
        | 'private'
        | 'pioneerVantage'
        | 'wimInternalTools'
        | 'wimMinimalist';
    logger?: LoggerConfig;
}

export interface WebAppConfig extends TemplateConfig {
    isWebApp: true;
}