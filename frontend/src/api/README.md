## @mentori/api@1.0

This generator creates TypeScript/JavaScript client that utilizes [axios](https://github.com/axios/axios). The generated Node module can be used in the following environments:

Environment
* Node.js
* Webpack
* Browserify

Language level
* ES5 - you must have a Promises/A+ library installed
* ES6

Module system
* CommonJS
* ES6 module system

It can be used in both TypeScript and JavaScript. In TypeScript, the definition will be automatically resolved via `package.json`. ([Reference](https://www.typescriptlang.org/docs/handbook/declaration-files/consumption.html))

### Building

To build and compile the typescript sources to javascript use:
```
npm install
npm run build
```

### Publishing

First build the package then run `npm publish`

### Consuming

navigate to the folder of your consuming project and run one of the following commands.

_published:_

```
npm install @mentori/api@1.0 --save
```

_unPublished (not recommended):_

```
npm install PATH_TO_GENERATED_PACKAGE --save
```

### Documentation for API Endpoints

All URIs are relative to *http://localhost:8080/api*

Class | Method | HTTP request | Description
------------ | ------------- | ------------- | -------------
*AuthApi* | [**authLoginPost**](docs/AuthApi.md#authloginpost) | **POST** /auth/login | User login
*AuthApi* | [**authLogoutPost**](docs/AuthApi.md#authlogoutpost) | **POST** /auth/logout | User logout
*AuthApi* | [**authProfileGet**](docs/AuthApi.md#authprofileget) | **GET** /auth/profile | Get user profile
*AuthApi* | [**authRegisterPost**](docs/AuthApi.md#authregisterpost) | **POST** /auth/register | Register a new user
*ProfilesApi* | [**profilesDelete**](docs/ProfilesApi.md#profilesdelete) | **DELETE** /profiles | Delete user profile
*ProfilesApi* | [**profilesGet**](docs/ProfilesApi.md#profilesget) | **GET** /profiles | Get user profile
*ProfilesApi* | [**profilesPost**](docs/ProfilesApi.md#profilespost) | **POST** /profiles | Create user profile
*ProfilesApi* | [**profilesPublicGet**](docs/ProfilesApi.md#profilespublicget) | **GET** /profiles/public | Get public profiles
*ProfilesApi* | [**profilesPut**](docs/ProfilesApi.md#profilesput) | **PUT** /profiles | Update user profile


### Documentation For Models

 - [ModelsAuthResponse](docs/ModelsAuthResponse.md)
 - [ModelsCreateProfileRequest](docs/ModelsCreateProfileRequest.md)
 - [ModelsErrorResponse](docs/ModelsErrorResponse.md)
 - [ModelsLoginRequest](docs/ModelsLoginRequest.md)
 - [ModelsProfile](docs/ModelsProfile.md)
 - [ModelsRegisterRequest](docs/ModelsRegisterRequest.md)
 - [ModelsUpdateProfileRequest](docs/ModelsUpdateProfileRequest.md)
 - [ModelsUserResponse](docs/ModelsUserResponse.md)


<a id="documentation-for-authorization"></a>
## Documentation For Authorization


Authentication schemes defined for the API:
<a id="BearerAuth"></a>
### BearerAuth

- **Type**: API key
- **API key parameter name**: Authorization
- **Location**: HTTP header

