# React Rangeslider Extended [![NPM Package][npm_img]][npm_site]
> A lightweight responsive react range slider component forked from [whoisandie/react-rangeslider](https://github.com/whoisandie/react-rangeslider).

Check out [examples](https://oliverwehn.github.io/react-rangeslider-extended).

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

### Value Mapping
The `valueMapping` prop takes a function taking the arguments `min` and `max` that returns an object with definitions of segments on the slider’s range and how positions within these segments are mapped to values. 
This allows for example to let you set lower values more precisely and higher ones in larger steps. For each segment there is `toValue` (position to value) and a `toPos` (value to position) function defined. 
The keys of the definition object define the segements start position. See example below.
```js
...

class myComponent extends React.Component {
	...

	valueMapping = (min, max) => ({
		'0': {
			toValue: (percentage, range) => Math.round(
				(percentage < range ? percentage : range) * 100 * 2
			),
			toPos: value => value / 2 / 100,
		},
		'.25': {
			toValue: (percentage, range) => Math.round(
				(percentage < range ? percentage : range) * 100
			),
			toPos: value => value / 100,
		},
		'.5': {
			toValue: (percentage, range, value) => Math.round(
				percentage / range * (max - value)
			),
			toPos: (value, range, span) => (
				value / span * range
			),
		}
	});

	render() {
		return (
			<Slider
				min={0}
				max={1000}
				value={this.state.value}
				onChange={this.handleChange}
				valueMapping={this.valueMapping} />
			<div className="value">Value: {this.state.value}</div>
		);
	}
}
```

## Issues
Feel free to contribute. Submit a Pull Request or open an issue for further discussion.


## Todo
- Ship styles along with component
- Tests using Enzyme

## License
MIT &copy; [whoisandie](http://whoisandie.com) & [Oliver Wehn](http://oliverwehn.com)

[npm_img]: https://img.shields.io/npm/v/react-rangeslider-extended.svg?style=flat-square
[npm_site]: https://www.npmjs.org/package/react-rangeslider-extended
