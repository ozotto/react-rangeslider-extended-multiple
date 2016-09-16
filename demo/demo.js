import './demo.scss';

import React, { Component } from 'react';
import Slider from 'react-rangeslider-extended';

class Demo extends Component {
	constructor(props, context) {
		super(props, context);
		this.state = {
			hor: 50,
			seg: 20,
			ver: 50,
			flo: 10.2,
			neg: -10,
			valuesScale: [-100,0,100, 50, -50],
			comparator: [35, 70]
		};
	}

	handleChangeHor = (value) => {
		this.setState({
			hor: value
		});
	}

	handleChangeSeg = (value) => {
		this.setState({
			seg: value
		});
	}

	handleChangeSegComplete = (value) => {
		console.log('Change completed with ' + value + '.');
	}

	handleChangeVer = (value) => {
		this.setState({
			ver: value,
		});
	}

	handleChangeNeg = (value) => {
		this.setState({
			neg: value,
		});
	}

	handleChangeFlo = (value) => {
		this.setState({
			flo: value,
		});
	}

	valueMapper(min, max) {
		return {
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
		};
	}

	valueToCurr = (value) => {
	  let formatted = Math.round(parseFloat(value) * 100) / 100;
	  const segments = (`${formatted}`).split('.');
	  if (segments.length === 1) segments.push('00');
	  if (segments[1].length < 2) segments[1] += '0'.repeat(2 - segments[1].length);
	  formatted = segments.join(',');
	  return formatted;
	}

	render() {
		let { hor, seg, ver, neg, flo, valuesScale, comparator } = this.state;
		return (
			<div className="wrapper">
				
				<section id="examples">
					
					<h4>Slider</h4>
					<Slider
						min={-100}
						max={100}
						value={hor}
						scale={valuesScale}
						comparator = {comparator}
						diffColor = {true}
						onChange={this.handleChangeHor} />
					<hr/>
					<div className="value">Value: {hor}</div>
					

				</section>

				
			</div>
		);
	}
}

export default Demo;
