import { CommonModule, DatePipe } from '@angular/common';
import { Injector, ModuleWithProviders, NgModule, Provider, Type } from '@angular/core';
import { ActivatedRoute, Router, ROUTES } from '@angular/router';
import { dataResolverFactory } from './services/data-resolver-factory';
import { DateDirective } from './components/date.directive';
import { FileDirective } from './components/file.directive';
import { GenericLinkDirective } from './components/generic-link.directive';
import { guardResolverFactory } from './services/guard-resolver-factory';
import { ImageDirective } from './components/image.directive';
import { LinkDirective } from './components/link.directive';
import { MissingComponentComponent } from './components/missing-component.component';
import { HiddenRenderingComponent } from './components/hidden-rendering.component';
import { PlaceholderLoadingDirective } from './components/placeholder-loading.directive';
import { PlaceholderComponent } from './components/placeholder.component';
import { EditFrameComponent } from './components/editframe.component';
import {
  ComponentNameAndModule,
  ComponentNameAndType,
  DATA_RESOLVER,
  DYNAMIC_COMPONENT,
  GUARD_RESOLVER,
  PLACEHOLDER_COMPONENTS,
  PLACEHOLDER_LAZY_COMPONENTS,
  PLACEHOLDER_MISSING_COMPONENT_COMPONENT,
  PLACEHOLDER_HIDDEN_RENDERING_COMPONENT,
} from './services/placeholder.token';
import { RawComponent } from './components/raw.component';
import { RenderComponentComponent } from './components/render-component.component';
import { RenderEachDirective } from './components/render-each.directive';
import { RenderEmptyDirective } from './components/render-empty.directive';
import { RichTextDirective } from './components/rich-text.directive';
import { RouterLinkDirective } from './components/router-link.directive';
import { TextDirective } from './components/text.directive';
import { JssComponentFactoryService } from './services/jss-component-factory.service';
import { JssStateService } from './services/jss-state.service';
import { EditingScriptsComponent } from './components/editing-scripts.component';
import { FormComponent } from './components/form.component';

@NgModule({
  imports: [CommonModule],
  declarations: [
    FileDirective,
    ImageDirective,
    LinkDirective,
    RouterLinkDirective,
    GenericLinkDirective,
    DateDirective,
    RenderEachDirective,
    RenderEmptyDirective,
    PlaceholderLoadingDirective,
    RenderComponentComponent,
    PlaceholderComponent,
    RawComponent,
    RichTextDirective,
    TextDirective,
    MissingComponentComponent,
    HiddenRenderingComponent,
    EditFrameComponent,
    EditingScriptsComponent,
    FormComponent,
  ],
  exports: [
    FileDirective,
    ImageDirective,
    DateDirective,
    LinkDirective,
    RouterLinkDirective,
    GenericLinkDirective,
    RenderEachDirective,
    RenderEmptyDirective,
    RenderComponentComponent,
    PlaceholderComponent,
    HiddenRenderingComponent,
    PlaceholderLoadingDirective,
    RichTextDirective,
    TextDirective,
    EditFrameComponent,
    EditingScriptsComponent,
    FormComponent,
  ],
})
export class JssModule {
  /**
   * Instantiates the JSS module with no component factory.
   * Useful for using it from libraries. Most of the time you'd want withComponents()
   * @returns {ModuleWithProviders<JssModule>} module
   */
  static forRoot(): ModuleWithProviders<JssModule> {
    return {
      ngModule: JssModule,
      providers: [
        DatePipe,
        JssStateService,
        JssComponentFactoryService,
        {
          provide: GUARD_RESOLVER,
          useFactory: guardResolverFactory,
          deps: [Injector, ActivatedRoute, Router],
        },
        {
          provide: DATA_RESOLVER,
          useFactory: dataResolverFactory,
          deps: [Injector, ActivatedRoute, Router],
        },
      ],
    };
  }

  /**
   * Instantiates a module for a lazy-loaded JSS component(s)
   * @param {Type<unknown> | Record<string, Type<unknown>> } value - component or map of components
   * @returns {ModuleWithProviders<JssModule>} module
   */
  static forChild(
    value: Type<unknown> | { [key: string]: Type<unknown> }
  ): ModuleWithProviders<JssModule> {
    return {
      ngModule: JssModule,
      providers: [
        { provide: ROUTES, useValue: [], multi: true },
        { provide: DYNAMIC_COMPONENT, useValue: value },
      ],
    };
  }

  /**
   * Instantiates the JSS module and specifies the mapping from component name to component implementation.
   * Appropriate when defining the set of JSS components that your app is aware of.
   * @param {ComponentNameAndType[]} components
   * @param {ComponentNameAndModule[]} [lazyComponents]
   * @returns {ModuleWithProviders<JssModule>} module
   */
  static withComponents(
    components: ComponentNameAndType[],
    lazyComponents?: ComponentNameAndModule[]
  ): ModuleWithProviders<JssModule> {
    return {
      ngModule: JssModule,
      providers: [
        { provide: PLACEHOLDER_COMPONENTS, useValue: components },
        { provide: PLACEHOLDER_LAZY_COMPONENTS, useValue: lazyComponents || [] },
        { provide: ROUTES, useValue: lazyComponents || [], multi: true },
        { provide: PLACEHOLDER_MISSING_COMPONENT_COMPONENT, useValue: MissingComponentComponent },
        { provide: PLACEHOLDER_HIDDEN_RENDERING_COMPONENT, useValue: HiddenRenderingComponent },
        ...(JssModule.forRoot().providers as Provider[]),
      ],
    };
  }
}
