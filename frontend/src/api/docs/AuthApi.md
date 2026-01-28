# AuthApi

All URIs are relative to *http://localhost:8080/api*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**authLoginPost**](#authloginpost) | **POST** /auth/login | User login|
|[**authLogoutPost**](#authlogoutpost) | **POST** /auth/logout | User logout|
|[**authProfileGet**](#authprofileget) | **GET** /auth/profile | Get user profile|
|[**authRegisterPost**](#authregisterpost) | **POST** /auth/register | Register a new user|

# **authLoginPost**
> ModelsAuthResponse authLoginPost(request)

Authenticate user with email and password

### Example

```typescript
import {
    AuthApi,
    Configuration,
    ModelsLoginRequest
} from '@mentori/api';

const configuration = new Configuration();
const apiInstance = new AuthApi(configuration);

let request: ModelsLoginRequest; //User login credentials

const { status, data } = await apiInstance.authLoginPost(
    request
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **request** | **ModelsLoginRequest**| User login credentials | |


### Return type

**ModelsAuthResponse**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Login successful |  -  |
|**400** | Invalid input data |  -  |
|**401** | Invalid credentials |  -  |
|**500** | Internal server error |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **authLogoutPost**
> { [key: string]: string; } authLogoutPost()

Invalidate user session (client-side token removal)

### Example

```typescript
import {
    AuthApi,
    Configuration
} from '@mentori/api';

const configuration = new Configuration();
const apiInstance = new AuthApi(configuration);

const { status, data } = await apiInstance.authLogoutPost();
```

### Parameters
This endpoint does not have any parameters.


### Return type

**{ [key: string]: string; }**

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Logout successful |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **authProfileGet**
> ModelsUserResponse authProfileGet()

Get current authenticated user\'s profile

### Example

```typescript
import {
    AuthApi,
    Configuration
} from '@mentori/api';

const configuration = new Configuration();
const apiInstance = new AuthApi(configuration);

const { status, data } = await apiInstance.authProfileGet();
```

### Parameters
This endpoint does not have any parameters.


### Return type

**ModelsUserResponse**

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | User profile |  -  |
|**401** | Unauthorized |  -  |
|**404** | User not found |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **authRegisterPost**
> ModelsAuthResponse authRegisterPost(request)

Create a new user account with email, password, and role

### Example

```typescript
import {
    AuthApi,
    Configuration,
    ModelsRegisterRequest
} from '@mentori/api';

const configuration = new Configuration();
const apiInstance = new AuthApi(configuration);

let request: ModelsRegisterRequest; //User registration data

const { status, data } = await apiInstance.authRegisterPost(
    request
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **request** | **ModelsRegisterRequest**| User registration data | |


### Return type

**ModelsAuthResponse**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**201** | User created successfully |  -  |
|**400** | Invalid input data |  -  |
|**409** | User already exists |  -  |
|**500** | Internal server error |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

