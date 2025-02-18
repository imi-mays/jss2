## Unreleased

* `FETCH_WITH.REST` constant string value from '@sitecore-jss/sitecore-jss' package now is set to 'REST' instead of 'Rest'. If you are using this constant in your code, please update your FETCH_WITH env variable to 'REST'.

# Angular

* Update the JssContextService and all the references to it, since some of the sitecore-jss-angular components now rely on the application state:
    * In `\src\app\jss-context.service.ts`:
        * Replace the import from `sitecore-jss-angular`:
            ```
            import { LayoutServiceData } from '@sitecore-jss/sitecore-jss-angular';
            ```  
            with
            ```
            import { LayoutServiceData, JssStateService } from '@sitecore-jss/sitecore-jss-angular';
            ```
        * Remove `BehaviorSubject` import
        * Remove the `state` field (`state: BehaviorSubject<JssState>;`) 
        * Add two getters and replace constuctor as below:
        ```
        get state() {
            return this.stateService.state;
        }
        get stateValue() {
            return this.stateService.getStateValue();
        }
        constructor(protected transferState: TransferState, protected layoutService: JssLayoutService, protected stateService: JssStateService<JssState>) {
        }
        ```
        * Replace all `this.state.next` calls with `this.stateService.setState`
        * Replace all `this.state.value` calls with `this.stateService.getStateValue()`
    * In `\src\app\jss-context.server-side.service.ts`:
        * Add import for `JssStateService`:
            ```
            import { JssStateService } from '@sitecore-jss/sitecore-jss-angular';
            ```
        * Modify the constructor. Pass `JssStateService` and propagate it to base class. Your constructor should look like this:
        ```
            constructor(
                protected transferState: TransferState,
                protected layoutService: JssLayoutService,
                protected stateService: JssStateService<JssState>,
                // this initial state from sitecore is injected by server.bundle for "integrated" mode
                @Inject('JSS_SERVER_LAYOUT_DATA') private serverToSsrState: JssState
            ) {
                super(transferState, layoutService, stateService);
            }
        ```

* Update i18n initialization to gain the performance improvement during fetching Dictionary Data for using SSR:
  * Inject _TransferState_ both on the server and client side:

    `app.module.ts`:

    ```ts
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: (transferState: TransferState) =>
          new JssTranslationClientLoaderService(new JssTranslationLoaderService(), transferState),
        deps: [TransferState],
      },
    }),
    ```

    `app.server.module.ts`:

    ```ts
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: (
          ssrViewBag: {
            [key: string]: unknown;
            dictionary: { [key: string]: string };
          },
          transferState: TransferState
        ) => new JssTranslationServerLoaderService(ssrViewBag, transferState),
        deps: ['JSS_SERVER_VIEWBAG', TransferState],
      },
    }),
    ```

  * In `app\i18n\jss-translation-server-loader.service.ts`:
    * Inject _TransferState_.
    * Make sure to set _dictionary_ data in _transferState_.

    ```ts
        export const dictionaryStateKey: StateKey<DictionaryPhrases> = makeStateKey<DictionaryPhrases>(
            'dictionary'
        );

        ...

        getTranslation(_lang: string) {
            const dictionary = this.serverViewBag.dictionary;

            this.transferState.set(dictionaryStateKey, dictionary);
            ...
        }
    ```

  * In `app\i18n\jss-translation-client-loader.service.ts`:
    * Inject _TransferState_.
    * Make sure to check for _dictionary_ data in _transferState_ and use it if available and provided by the server.

    ```ts
        import { dictionaryStateKey } from './jss-translation-server-loader.service';

        ...

        getTranslation(lang: string): Observable<DictionaryPhrases> {
            const dictionary = this.transferState.get(dictionaryStateKey, null);

            if (dictionary) {
                return of(dictionary);
            }
            ...
        }
    ```
  * In root folder .gitingore, add the rule for `.angular` if not already present
  * Replace the contents of `src/environments/.gitingore` with the following, if not done so already:
  ```
    *
    !.gitignore
  ```

# Angular - XMCloud

If you plan to use the Angular SDK with XMCloud, you will need to perform next steps:

* On top of existing Angular sample, apply changes from "angular-xmcloud" add-on.
* Update package.json "build:client" script to use explicit "production" configuration:

    ```shell
    "build:client": "cross-env-shell ng build --configuration=production --base-href $npm_package_config_sitecoreDistPath/browser/ --output-path=$npm_package_config_buildArtifactsPath/browser/"
    ```

* Update /scripts/bootstrap.ts file to generate a metadata for editing integration:
    Assuming that you have a `generate-metadata.ts` file pulled from the "angular-xmcloud" add-on:

    ```ts
    ...
    /*
    METADATA GENERATION
    */
    require('./generate-metadata');
    ...
    ```

* Update /scripts/generate-component-factory.ts to generate a list of component names for the editing integration, see implementation in the the "angular" template:

    ```ts
    import { AppComponentsSharedModule } from './app-components.shared.module';
    ${imports.join('\n')}

    export const components = [
        ${components.map((c) => `'${c}'`).join(',\n  ')}
    ];

    @NgModule({
    ```

* Restructure /src/app/lib/client-factory.ts. This is needed in order to separate the GraphQL client factory configuration from the client factory itself, so we have a single source of GraphQL endpoint resolution that can be used in different places. For example node-xmcloud-proxy, scripts/update-graphql-fragment-data.ts, etc.
  * Introduce /src/app/lib/graphql-client-factory/config.ts. It should expose the _getGraphQLClientFactoryConfig_ that returns the configuration object for the GraphQL client factory, for example (full code snippet you can find in the "angular-xmcloud" add-on):

    ```ts
    import { GraphQLRequestClientFactoryConfig } from '@sitecore-jss/sitecore-jss-angular/cjs';
    import { environment as env } from '../../../environments/environment';

    export const getGraphQLClientFactoryConfig = () => {
        let clientConfig: GraphQLRequestClientFactoryConfig;

        if (env.graphQLEndpoint && env.sitecoreApiKey) {
            clientConfig = {
            endpoint: env.graphQLEndpoint,
            apiKey: env.sitecoreApiKey,
            };
        }

        ...

        return clientConfig;
    };
    ```

    * Introduce /src/app/lib/graphql-client-factory/index.ts. It should contain the _default_ export that returns the GraphQL client factory, for example:

    ```ts
    import { GraphQLRequestClient } from '@sitecore-jss/sitecore-jss-angular/cjs';
    import { getGraphQLClientFactoryConfig } from './config';

    const createGraphQLClientFactory = () => {
        const clientConfig = getGraphQLClientFactoryConfig();

        return GraphQLRequestClient.createClientFactory(clientConfig);
    };

    export default createGraphQLClientFactory();
    ```

    * Make sure to import variables from @sitecore-jss/sitecore-jss-angular/cjs, not from @sitecore-jss/sitecore-jss-angular, since graphql-client-factory is used in the server bundle.

    * Update all the references to the GraphQL client factory in the application to use the new structure.

* Update /scripts/update-graphql-fragment-data.ts to utilize the GraphQL client factory and client factory configuration. The implementation you can find in the "angular" template (/scripts/update-graphql-fragment-data.ts
)
  * Remove "isomorphic-fetch" npm dependency

* Update /scripts/generate-config.ts, it's needed since generate-config can be called outside of /scripts/bootstrap.ts file. Add dotenv import:

    ```ts
    import 'dotenv/config';
    ```


* Update /server.bundle.ts to additionally expose new properties:

    ```ts
    import { environment } from './src/environments/environment';
    import clientFactory from './src/app/lib/graphql-client-factory';
    import { getGraphQLClientFactoryConfig } from './src/app/lib/graphql-client-factory/config';
    import { dictionaryServiceFactory } from './src/app/lib/dictionary-service-factory';
    import { layoutServiceFactory } from './src/app/lib/layout-service-factory';
    import { components } from './src/app/components/app-components.module';
    import metadata from './src/environments/metadata.json';

    ...
    const defaultLanguage = environment.defaultLanguage;
    const getClientFactoryConfig = getGraphQLClientFactoryConfig;

    export {
        ...
        clientFactory,
        getClientFactoryConfig,
        dictionaryServiceFactory,
        layoutServiceFactory,
        defaultLanguage,
        components,
        metadata
    };
    ```

    * Optionally, you can follow our new approach and create a separate file `server.exports.ts` where you can import/export all the necessary properties and then re-export them from `server.bundle.ts`. See the "angular-xmcloud" add-on for more details.

* GraphQL FETCH_WITH method is required to be used, REST is not supported. Update FETCH_WITH environment variable if needed.

* Update /src/app/lib/dictionary-service-factory.ts to use new `useSiteQuery` property. You will be able to use a Site query to get the dictionary data:

    ```ts
    new GraphQLDictionaryService({
        clientFactory,
        siteName: env.sitecoreSiteName,
        useSiteQuery: true,
    });
    ```

* Make sure to render new `sc-editing-scripts` component (exposed by JssModule) in your Layout, since it's required for the editing integration. You might need to introduce a separate _Scripts_ module for that, see example in _angular-xmcloud_ add-on _angular-xmcloud/src/app/routing/scripts/scripts.module.ts_:

    ```html
    <sc-editing-scripts></sc-editing-scripts>
    ```

* In order to be able to start using Forms in XMCloud you need to register a Form component and add required configuration:
    * Update your _scripts/generate-component-builder_ template::
        * Register Form component

            ```ts
            const packages = [
            {
                name: '@sitecore-jss/sitecore-jss-angular',
                components: [{ componentName: 'Form', moduleName: 'FormComponent' }],
            },
            ]
            ```

            Make sure to don't push such components to the "declarations" list, since the related module is a part of "imports" list.
        * Add to "providers" list a new InjectionToken, EDGE_CONFIG token is needed for Form component to be able to fetch the form from Sitecore Edge:

            ```ts
            import { EDGE_CONFIG } from '@sitecore-jss/sitecore-jss-angular';
            import { environment } from '../../environments/environment';
            ...
            providers: [
                {
                    // This configuration is used to be able to integrate sitecore-jss-angular SDK with Sitecore Edge
                    provide: EDGE_CONFIG,
                    useValue: {
                        sitecoreEdgeUrl: environment.sitecoreEdgeUrl,
                        sitecoreEdgeContextId: environment.sitecoreEdgeContextId,
                    },
                },
            ],
            ```

    

# @sitecore-jss/sitecore-jss-proxy

* Update the import statement

    ```ts
    // from
    import scProxy, { ProxyConfig, ServerBundle } from '@sitecore-jss/sitecore-jss-proxy';
    // to
    import { headlessProxy } from '@sitecore-jss/sitecore-jss-proxy';
    ...
    server.use(
        '*',
        headlessProxy.middleware(
            config.serverBundle.renderView,
            config,
            config.serverBundle.parseRouteUrl
        )
    );
    ```

    Now `middleware`, `ProxyConfig`, `ServerBundle` properties are available on the "headlessProxy" object.

* `express` dependency is marked as a peer dependency, so you need to match the required version "^4.19.2".

* Copy the `.gitignore` file from fresh latest version proxy app into your existing proxy app, if not already present.
