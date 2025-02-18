[@sitecore-jss/sitecore-jss-angular](../README.md) / MemoryCacheClient

# Class: MemoryCacheClient\<T\>

A cache client that uses the 'memory-cache' library (https://github.com/ptarjan/node-cache).
This class is meant to be extended or used as a mixin; it's not meant to be used directly.

**`Mixin`**

## Type parameters

| Name | Description |
| :------ | :------ |
| `T` | The type of data being cached. |

## Implements

- [`CacheClient`](../interfaces/CacheClient.md)\<`T`\>

## Table of contents

### Constructors

- [constructor](MemoryCacheClient.md#constructor)

### Properties

- [cache](MemoryCacheClient.md#cache)
- [options](MemoryCacheClient.md#options)

### Methods

- [getCacheValue](MemoryCacheClient.md#getcachevalue)
- [setCacheValue](MemoryCacheClient.md#setcachevalue)

## Constructors

### constructor

• **new MemoryCacheClient**\<`T`\>(`options`)

Initializes a new instance of

#### Type parameters

| Name |
| :------ |
| `T` |

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `options` | [`CacheOptions`](../interfaces/CacheOptions.md) | Configuration options |

**`See`**

 - MemoryCacheClient using the provided
 - CacheOptions

#### Defined in

packages/sitecore-jss/types/cache-client.d.ts:48

## Properties

### cache

• `Private` **cache**: `any`

#### Defined in

packages/sitecore-jss/types/cache-client.d.ts:43

___

### options

• **options**: [`CacheOptions`](../interfaces/CacheOptions.md)

#### Defined in

packages/sitecore-jss/types/cache-client.d.ts:42

## Methods

### getCacheValue

▸ **getCacheValue**(`key`): ``null`` \| `T`

Retrieves a value from the cache.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `key` | `string` | The cache key. |

#### Returns

``null`` \| `T`

The cache value as {T}, or null if the specified key is not found in the cache.

#### Implementation of

[CacheClient](../interfaces/CacheClient.md).[getCacheValue](../interfaces/CacheClient.md#getcachevalue)

#### Defined in

packages/sitecore-jss/types/cache-client.d.ts:55

___

### setCacheValue

▸ **setCacheValue**(`key`, `value`): `T`

Adds a value to the cache for the specified cache key.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `key` | `string` | The cache key. |
| `value` | `T` | The value to cache. |

#### Returns

`T`

The value added to the cache.

#### Implementation of

[CacheClient](../interfaces/CacheClient.md).[setCacheValue](../interfaces/CacheClient.md#setcachevalue)

#### Defined in

packages/sitecore-jss/types/cache-client.d.ts:63
