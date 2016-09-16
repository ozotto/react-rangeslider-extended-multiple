# React Rangeslider Extended [![NPM Package][npm_img]][npm_site]
> A lightweight responsive react range slider component forked from [whoisandie/react-rangeslider](https://github.com/whoisandie/react-rangeslider).

## Install
Install via `npm` (use `--save` to include it in your package.json)

```bash
$ npm install react-rangeslider-extended-multiple --save
```

## Usage
React Rangeslider is bundled with a single slider component. You can require them in plain old ES5 syntax or import them in ES6 syntax.

...plain old ES5

```js
var React = require('react');
var Slider = require('react-rangeslider-extended');

var Volume = React.createClass({
	getInitialState: function(){
		return {
			value: 10,
		};
	}

	handleChange: function(value) {
		this.setState({
			value: value,
		});
	}

	render: function() {
		return (
			<Slider
        value={value}
        orientation="vertical"
        onChange={this.handleChange} />
		);
	}
});

module.exports = Volume;
```

... or use ES6 syntax

```js
import React, { Component } from 'react';
import Slider from 'react-rangeslider-extended';

export default Volume extends Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      value: 10 /** Start value **/
    };
  }

  handleChange(value) {
    this.setState({
      value: value
    });
  }

  render() {
    return (
      <Slider
        value={value}
        orientation="vertical"
        onChange={this.handleChange} />
    );
  }
}
```
There's also a umd version available at `lib/umd`. The component is available on `window.ReactRangeslider`. To style the slider, please refer the rangeslider styles in `demo/demo.less` file.

## API
Rangeslider is bundled with a single component, that accepts data and callbacks only as `props`.

### Component

```js
import Slider from 'react-rangeslider-extended'

// inside render
<Slider
	min={String or Number}
	max={String or Number}
	step={String or Number}
	orientation={String}
  value={Number}
  onChange={Function}
  onChangeComplete={Function}
  valueMapping={Function} />
```

### Props

Prop   	 			 			|  Default      |  Description
---------   	 			|  -------      |  -----------
`min`     		 			|  0				   	|  minimum value the slider can hold
`max`    			 			|  100				  |  maximum value the slider can hold
`step` 				 			|  1          	|  step in which increments/decrements have to be made
`orientation`  			|  horizontal   |  orientation of the slider
`value`  			 			|  -            |  current value of the slider
`onChange`  	 			|  -            |  function the slider takes, current value of the slider as the first parameter
`onChangeComplete`	|  -            |  function the slider takes and fires after interaction has ended, current value of the slider as the first parameter
`valueMapping` 			|  default func |  function returning an object that defines segments and `toValue` and `toPos` methods to controll position to value (and vice versa) mapping


## Issues
Feel free to contribute. Submit a Pull Request or open an issue for further discussion.

## License
MIT &copy; [whoisandie](http://whoisandie.com) & [Oliver Wehn](http://oliverwehn.com)

[npm_img]: https://img.shields.io/npm/v/react-rangeslider-extended.svg?style=flat-square
[npm_site]: https://www.npmjs.org/package/react-rangeslider-extended
