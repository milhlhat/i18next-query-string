# i18next-query-string Plugin

The `i18next-query-string` plugin enables seamless integration of query string parameters into your i18next localization workflow. This allows for dynamic parsing values based on key parameters, enhancing the flexibility of your localization process. 
For example, when you need fetch data from the server and use it in your translations.

## Installation

Install the plugin using npm:

```bash
npm install i18next-query-string
```

## Example

```
  {
      "path": {
          "to": 'My name is {{firstName}}',
      }
  }
  <Trans key='path.to?firstName=John'> // 'My name is John'
```

## Configuration

To utilize the i18next-query-string plugin, follow these steps:

Import and Initialize the Plugin:

After installing, import the plugin into your project and initialize it with your i18next instance.

```
import i18next from 'i18next';
import I18nextQueryString from 'i18next-query-string';

i18next
  .use(I18nextQueryString)
  .init({
    postProcess: [I18nextQueryString.name],// Required
    // Your i18next configuration
  });
```