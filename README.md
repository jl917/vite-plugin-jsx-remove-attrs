# vite-plugin-jsx-remove-attrs

This is a SWC-based plugin that removes some attributes from jsx, such as data-testid.

Under normal circumstances, it will only take effect when compiling, and will not take effect on the vite server.



## Table of Contents

- [Installation](#installation)
- [Usage](#usage)
- [Maintainers](#maintainers)
- [Contributing](#contributing)
- [License](#license)



## Installation

```sh
npm install --save-dev @julong/vite-plugin-jsx-remove-attrs
```



## Usage


```jsx
import removeAttrs from '@julong/vite-plugin-jsx-remove-attrs';

export default defineConfig(() => {
  plugins: [
    removeAttrs(['data-testid', 'data-xxx']),
  ],
});
```


## Maintainers

JuLong - [jl917](c)



## Contributing

Anyone is welcome to participate in the maintenance and development of this project, and can also submit Issues and PR's



## License

[MIT](https://github.com/jl917/jnpkg/blob/master/LICENSE)
