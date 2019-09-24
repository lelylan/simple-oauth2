## Examples

Before running any example, please set the following environment variables:

```bash
export CLIENT_ID="your client id"
export CLIENT_SECRET="your client secret"
```

The following authorization services are provided as examples to get a better idea of how to use this library on some of the most common use cases:


### Microsoft

Microsoft requires the credentials information during the token exchange to be sent at the request body. It also requires to send the **redirect_uri** argument. See the `./microsoft.js` module as a reference implementation or execute the example with:

```bash
npm run start:microsoft
```

### Github

See the `./github.js` module as a reference implementation or execute the example with:

```bash
npm run start:github
```

### Dropbox

See the `./dropbox.js` module as a reference implementation or execute the example with:

```bash
npm run start:dropbox
```
