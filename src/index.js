import './styles.scss';

import React, { PropTypes, Component } from 'react';
import { findDOMNode } from 'react-dom';
import cx from 'classnames';

function capitalize(str) {
	return str.charAt(0).toUpperCase() + str.substr(1);
}

function maxmin(pos, min, max) {
	if (pos < min) { return min; }
	if (pos > max) { return max; }
	return pos;
}

const constants = {
	orientation: {
		horizontal: {
			dimension: 'width',
			direction: 'left',
			coordinate: 'x',
		},
		vertical: {
			dimension: 'height',
			direction: 'top',
			coordinate: 'y',
		}
	}
};

class Slider extends Component {
	static propTypes = {
		min: PropTypes.number,
		max: PropTypes.number,
		step: PropTypes.number,
		value: PropTypes.number,
		orientation: PropTypes.string,
		valueMapping: PropTypes.func,
		onChange: PropTypes.func,
		onChangeComplete: PropTypes.func,
		className: PropTypes.string,
	}

	static defaultProps = {
		min: 0,
		max: 100,
		step: 1,
		valueMapping: (min, max) => ({
			'0': {
				toValue: (percentage, range, value) => (percentage * (max - min)),
				toPos: (value, range, span) => Math.abs(value / (max - min)),
			},
		}),
		value: 0,
		orientation: 'horizontal',
	}

	state = {
		limit: 0,
		grab: 0,
	}

  // Add window resize event listener here
  componentDidMount() {
		window.addEventListener('resize', this.handleUpdate);
		this.handleUpdate();
  }

  // remove window resize event listener here
  componentWillUnmount() {
		window.removeEventListener('resize', this.handleUpdate);
  }

  handleUpdate = () => {
  	let { orientation } = this.props;
  	let dimension = capitalize(constants.orientation[orientation].dimension);
  	const sliderPos = findDOMNode(this.refs.slider)['offset' + dimension];
  	const handlePos = findDOMNode(this.refs.handle)['offset' + dimension]
  	this.setState({
  		limit: sliderPos - handlePos,
  		grab: handlePos / 2,
  	});
  }

  handleStart = () => {
  	document.addEventListener('mousemove', this.handleDrag);
  	document.addEventListener('mouseup', this.handleEnd);
    document.addEventListener('touchend', this.handleEnd);
  }

  handleDrag = (e) => {
  	this.handleNoop(e);
  	let value, { onChange } = this.props;
  	if (!onChange) return;
  	value = this.position(e);
  	onChange && onChange(value);
  }

  handleEnd = (e) => {
  	document.removeEventListener('mousemove', this.handleDrag);
  	document.removeEventListener('mouseup', this.handleEnd);
    document.removeEventListener('touchend', this.handleEnd);

  	this.handleDrag(e);

  	let value, { onChangeComplete } = this.props;
  	if (!onChangeComplete) return;
  	value = this.position(e);
    onChangeComplete && onChangeComplete(value);
  }

  handleNoop = (e) => {
  	e.stopPropagation();
  	e.preventDefault();
  }

  getPositionFromValue = (value) => {
  	let percentage, pos;
  	let { limit } = this.state;
  	let { min, max } = this.props;
  	
  	percentage = this.mapPositionToValue(value, min, max);
  	if (percentage > 1) percentage = 1;
  	pos = Math.round(percentage * limit);

  	return pos;
  }

  mapPositionToValue = (value, min, max) => {
  	const valueMapping = this.props.valueMapping(min, max);
		const ranges = Object.keys(valueMapping);
		let mappedPos = 0;
		let i = 0;
		let remain = value - min;
		let currRange = 0;
		let nextRange;
		let rangeSpan;
		let compValue = min;
		let compRangeValue;
		while (i < ranges.length && remain > 0) {
			nextRange = (parseFloat(ranges[i+1]) || 1);
			rangeSpan = nextRange - currRange;
			compRangeValue = valueMapping[ranges[i]].toValue(rangeSpan, rangeSpan, value - remain);
			compValue += compRangeValue;
			if (compRangeValue >= remain) {
				mappedPos += valueMapping[ranges[i]].toPos(remain, rangeSpan, compRangeValue);
				remain = 0;
			} else {
				mappedPos += rangeSpan;
				remain -= compRangeValue;
			}
			currRange = nextRange;
			i++;
		}
		return mappedPos;
  }

  getValueFromPosition = (pos) => {
  	let percentage;
  	let { limit } = this.state;
  	let { orientation, min, max, step } = this.props;
  	percentage = (maxmin(pos, 0, limit) / (limit || 1));
  	let value = this.mapValueToPosition(percentage, min, max);
  	if (orientation === 'horizontal') {
  		value = step * Math.round((value - min) / step) + min;
  	} else {
  		value = max - (step * Math.round((value - min) / step) + min);
  	}
		if (value < min) value = min;
		else if (value > max) value = max;

  	return value;
  }

  mapValueToPosition = (percentage, min, max) => {
  	const valueMapping = this.props.valueMapping(min, max);
		const ranges = Object.keys(valueMapping);
		let mappedValue = min;
		let i = 0;
		let remain = percentage;
		let currRange = 0;
		let nextRange;
		let rangeSpan;
		while (i < ranges.length && remain > 0) {
			nextRange = (parseFloat(ranges[i+1]) || 1);
			rangeSpan = nextRange - currRange;
			mappedValue += valueMapping[ranges[i]].toValue(remain, rangeSpan, mappedValue);
			remain -= rangeSpan; 
			currRange = nextRange;
			i++;
		}
		return mappedValue;
  }

  position = (e) => {
  	let pos, value, { grab } = this.state;
  	let { orientation } = this.props;
  	const node = findDOMNode(this.refs.slider);
  	const coordinateStyle = constants.orientation[orientation].coordinate;
  	const directionStyle = constants.orientation[orientation].direction;
  	const coordinate = !e.touches
			? e['client' + capitalize(coordinateStyle)]
			: e.touches[0]['client' + capitalize(coordinateStyle)];
  	const direction = node.getBoundingClientRect()[directionStyle];

  	pos = coordinate - direction - grab;
  	value = this.getValueFromPosition(pos);

  	return value;
  }

  coordinates = (pos) => {
  	let value, fillPos, handlePos;
  	let { limit, grab } = this.state;
  	let { orientation } = this.props;

  	value = this.getValueFromPosition(pos);
  	handlePos = this.getPositionFromValue(value);

  	if (orientation === 'horizontal') {
  		fillPos = handlePos + grab;
  	} else {
  		fillPos = limit - handlePos + grab;
  	}

  	return {
  		fill: fillPos,
  		handle: handlePos,
  	};
  }

  render() {
  	let dimension, direction, position, coords, fillStyle, fillStyle2, handleStyle;
  	let { value, orientation, className } = this.props;

    let posZero, coordZero;

  	dimension = constants.orientation[orientation].dimension;
  	direction = constants.orientation[orientation].direction;

  	position = this.getPositionFromValue(value);
  	coords = this.coordinates(position);

  	fillStyle = {[dimension]: `${coords.fill}px`};
  	handleStyle = {[direction]: `${coords.handle}px`};

    posZero = this.getPositionFromValue(0);
    coordZero = this.coordinates(posZero);

    let fillSize, posLeft, back; 

    if(value > 0 ){
        fillSize = coords.fill - coordZero.fill;
        posLeft  = coordZero.fill;
        back = '#27ae60';
        console.log('PosZero: '+posLeft);
    }else{
        fillSize = coordZero.fill - coords.fill;
        posLeft = coords.handle + 15;
        back = '#ff3232';
    }

    /*let disableFill = 'initial';
    if(value < 0 ) disableFill = 'none';*/



/*    let fillSize = coords.fill - coordZero.fill
let fillSize2 = coordZero.fill - coords.fill*/
    

    fillStyle = { [dimension]: `${ fillSize }px`, [direction]: `${ posLeft }px` , background: `${back}` }
    //fillStyle2 = { [dimension]: `${fillSize2}px`, [direction]: `${coordZero.handle}px` , display: `${disableFill2}`   }



  	return (
  		<div
	  		ref="slider"
	  		className={cx('rangeslider ', 'rangeslider-' + orientation, className)}
	  		onMouseDown={this.handleStart}>
	  		<div
		  		ref="fill"
		  		className="rangeslider__fill"
		  		style={fillStyle} />
        
	  		<div
		  		ref="handle"
		  		className="rangeslider__handle"
					onMouseDown={this.handleStart}
					onTouchStart={ this.handleStart }
					onTouchMove={this.handleDrag}
					onClick={this.handleNoop}
		  		style={handleStyle} />
  		</div>
		);
  }
}

export default Slider;
