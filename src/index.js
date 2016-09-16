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
    scale: PropTypes.array,
    diffColor : PropTypes.bool,
    comparator : PropTypes.array,
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
    /*diffColor: true,
    scale: [100, 0, -100],
    comparator: [50, -50]*/
    
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

  generateScale = (scale) => {
    let design;

    design = scale.map(function(obj, index){
      
      let value   = this.getPositionFromValue(obj);     
      let coord   = this.coordinates(value);
      let handle  = 15;
      let display = 'block'
      if(obj == -100) handle = 0; 
      if(obj == -100 || obj == 100) display = 'none';

      let axe     = { 'left': `${coord.handle + handle}px`, 'display': `${display}` }
      let text    = { 'left': `${coord.handle + handle}px` }

       return(
        <div key={index}>
          <div
            ref="scale"
            className="rangeslider__scale"
            style={axe} /> 
          <div
            ref="scale"
            className="rangeslider__scale_text"
            style={text}>{ obj }</div>        
        </div>
       );

    },this)

    return design;
  }

  generateComparator = (comparator) => {
    let design;

    let handle0 = 9, handle1  = 9; // size handle minus size triangle
    
    if(comparator[0] == -100 || comparator[0] == -100 ) handle0 = 0;
    if(comparator[1] == 100 || comparator[1] == 100) handle1 = 25;
    
    let value0  = this.getPositionFromValue(comparator[0])
    let coord0  = this.coordinates(value0);
    
    let value1  = this.getPositionFromValue(comparator[1])
    let coord1  = this.coordinates(value1);    
    
    let style0  = { 'left': `${coord0.handle + handle0}px` }
    let style1  = { 'left': `${coord1.handle + handle1}px` }

    design = (
      <div>
        <div
            ref="scale"
            className="rangeslider__comparator0"
            style={style0}/>
        <div
            ref="scale"
            className="rangeslider__comparator1"
            style={style1}/>
      </div>
    )

    return design;
  }


  render() {
  	let dimension, direction, position, coords, fillStyle, handleStyle;
  	let { value, orientation, className, scale, diffColor, comparator } = this.props;

  	dimension = constants.orientation[orientation].dimension;
  	direction = constants.orientation[orientation].direction;

  	position = this.getPositionFromValue(value);
  	coords = this.coordinates(position);

  	fillStyle = {[dimension]: `${coords.fill}px`};
  	handleStyle = {[direction]: `${coords.handle}px`};

    //Color Fill 
    if(diffColor){
      let fillSize, posLeft, back; 
      let value0, coord0;

      value0 = this.getPositionFromValue(0);     
      coord0 = this.coordinates(value0);

      if(value > 0 ){
          fillSize = coords.fill - coord0.fill;
          posLeft  = coord0.fill;
          back = '#27ae60';
          
      }else{
          fillSize = coord0.fill - coords.fill;
          posLeft = coords.handle + 15;
          back = '#ff3232';
      }
      
      fillStyle = { [dimension]: `${ fillSize }px`, [direction]: `${ posLeft }px` , 'background': `${back}`, 'borderRadius': '0px' }
    }
    
    //Scale 
    let scales
    if(typeof scale !== 'undefined'){
      if(scale.length > 0) scales = this.generateScale(scale);
    }
    
    //Comparator
    let comparators
    if(typeof comparator !== 'undefined'){
      if(comparator.length > 0) comparators = this.generateComparator(comparator);
    }

  	return (
  		<div
	  		ref="slider"
	  		className={cx('rangeslider ', 'rangeslider-' + orientation, className)}
	  		onMouseDown={this.handleStart}>
	  		<div
		  		ref="fill"
		  		className="rangeslider__fill"
		  		style={fillStyle} />
        { scales }
        { comparators }
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
