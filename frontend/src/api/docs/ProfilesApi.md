# ProfilesApi

All URIs are relative to *http://localhost:8080/api*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**profilesDelete**](#profilesdelete) | **DELETE** /profiles | Delete user profile|
|[**profilesGet**](#profilesget) | **GET** /profiles | Get user profile|
|[**profilesPost**](#profilespost) | **POST** /profiles | Create user profile|
|[**profilesPublicGet**](#profilespublicget) | **GET** /profiles/public | Get public profiles|
|[**profilesPut**](#profilesput) | **PUT** /profiles | Update user profile|

# **profilesDelete**
> { [key: string]: string; } profilesDelete()

Delete the profile of the authenticated user

### Example

```typescript
import {
    ProfilesApi,
    Configuration
} from '@mentori/api';

const configuration = new Configuration();
const apiInstance = new ProfilesApi(configuration);

let authorization: string; //Bearer token (default to undefined)

const { status, data } = await apiInstance.profilesDelete(
    authorization
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **authorization** | [**string**] | Bearer token | defaults to undefined|


### Return type

**{ [key: string]: string; }**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | OK |  -  |
|**401** | Unauthorized |  -  |
|**404** | Not Found |  -  |
|**500** | Internal Server Error |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **profilesGet**
> ModelsProfile profilesGet()

Get the profile of the authenticated user

### Example

```typescript
import {
    ProfilesApi,
    Configuration
} from '@mentori/api';

const configuration = new Configuration();
const apiInstance = new ProfilesApi(configuration);

let authorization: string; //Bearer token (default to undefined)

const { status, data } = await apiInstance.profilesGet(
    authorization
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **authorization** | [**string**] | Bearer token | defaults to undefined|


### Return type

**ModelsProfile**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | OK |  -  |
|**401** | Unauthorized |  -  |
|**404** | Not Found |  -  |
|**500** | Internal Server Error |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **profilesPost**
> ModelsProfile profilesPost(profile)

Create a new profile for the authenticated user

### Example

```typescript
import {
    ProfilesApi,
    Configuration,
    ModelsCreateProfileRequest
} from '@mentori/api';

const configuration = new Configuration();
const apiInstance = new ProfilesApi(configuration);

let authorization: string; //Bearer token (default to undefined)
let profile: ModelsCreateProfileRequest; //Profile data

const { status, data } = await apiInstance.profilesPost(
    authorization,
    profile
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **profile** | **ModelsCreateProfileRequest**| Profile data | |
| **authorization** | [**string**] | Bearer token | defaults to undefined|


### Return type

**ModelsProfile**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**201** | Created |  -  |
|**400** | Bad Request |  -  |
|**401** | Unauthorized |  -  |
|**409** | Conflict |  -  |
|**500** | Internal Server Error |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **profilesPublicGet**
> Array<ModelsProfile> profilesPublicGet()

Get public profiles with optional filtering by expertise, interests, location, and role

### Example

```typescript
import {
    ProfilesApi,
    Configuration
} from '@mentori/api';

const configuration = new Configuration();
const apiInstance = new ProfilesApi(configuration);

let expertise: Array<string>; //Filter by expertise (comma-separated) (optional) (default to undefined)
let interests: Array<string>; //Filter by interests (comma-separated) (optional) (default to undefined)
let location: string; //Filter by location (optional) (default to undefined)
let role: string; //Filter by role (mentor, mentee, admin) (optional) (default to undefined)

const { status, data } = await apiInstance.profilesPublicGet(
    expertise,
    interests,
    location,
    role
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **expertise** | **Array&lt;string&gt;** | Filter by expertise (comma-separated) | (optional) defaults to undefined|
| **interests** | **Array&lt;string&gt;** | Filter by interests (comma-separated) | (optional) defaults to undefined|
| **location** | [**string**] | Filter by location | (optional) defaults to undefined|
| **role** | [**string**] | Filter by role (mentor, mentee, admin) | (optional) defaults to undefined|


### Return type

**Array<ModelsProfile>**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | OK |  -  |
|**500** | Internal Server Error |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **profilesPut**
> ModelsProfile profilesPut(profile)

Update the profile of the authenticated user

### Example

```typescript
import {
    ProfilesApi,
    Configuration,
    ModelsUpdateProfileRequest
} from '@mentori/api';

const configuration = new Configuration();
const apiInstance = new ProfilesApi(configuration);

let authorization: string; //Bearer token (default to undefined)
let profile: ModelsUpdateProfileRequest; //Profile update data

const { status, data } = await apiInstance.profilesPut(
    authorization,
    profile
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **profile** | **ModelsUpdateProfileRequest**| Profile update data | |
| **authorization** | [**string**] | Bearer token | defaults to undefined|


### Return type

**ModelsProfile**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | OK |  -  |
|**400** | Bad Request |  -  |
|**401** | Unauthorized |  -  |
|**404** | Not Found |  -  |
|**500** | Internal Server Error |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

