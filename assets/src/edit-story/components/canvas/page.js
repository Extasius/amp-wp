/**
 * External dependencies
 */
import styled from 'styled-components';
import Moveable from 'react-moveable';

/**
 * WordPress dependencies
 */
import { useCallback, useEffect } from '@wordpress/element';

/**
 * Internal dependencies
 */
import { useStory } from '../../app';
import { getComponentForType } from '../../elements';
import useCanvas from './useCanvas';

const Background = styled.div.attrs( { className: 'container' } )`
	background-color: ${ ( { theme } ) => theme.colors.fg.v1 };
	position: relative;
	width: 100%;
	height: 100%;
`;

const Selection = styled.div.attrs( { className: 'selection' } )`
	z-index: 2;
	border: 1px solid #448FFF;
	left: ${ ( { x } ) => `${ x }px` };
	top: ${ ( { y } ) => `${ y }px` };
	width: ${ ( { width } ) => `${ width }%` };
	height: ${ ( { height } ) => `${ height }%` };
	transform: ${ ( { rotationAngle } ) => `rotate(${ rotationAngle }deg)` };
	position: absolute;
`;

const Element = styled.div`
	cursor: pointer;
	user-select: none;
`;

function Page() {
	const {
		state: { currentPage, hasSelection, selectedElements },
		actions: { clearSelection, selectElementById, setPropertiesOnSelectedElements, toggleElementIdInSelection },

	} = useStory();
	const {
		actions: { setBackgroundClickHandler },
	} = useCanvas();
	const handleSelectElement = useCallback( ( id ) => ( evt ) => {
		if ( evt.metaKey ) {
			toggleElementIdInSelection( id );
		} else {
			selectElementById( id );
		}
		evt.stopPropagation();
	}, [ toggleElementIdInSelection, selectElementById ] );
	const selectionProps = hasSelection ? getUnionSelection( selectedElements, 0 ) : {};
	useEffect( () => {
		setBackgroundClickHandler( () => clearSelection() );
	}, [ setBackgroundClickHandler, clearSelection ] );

	let displayMoveable = false;
	const frame = {
		translate: [ 0, 0 ],
		rotate: selectionProps.rotationAngle,
	};

	return (
		<Background>
			{ currentPage && currentPage.elements.map( ( { type, id, ...rest } ) => {
				const comp = getComponentForType( type );
				const Comp = comp; // why u do dis, eslint?
				// Ignore multi-selection for now.
				if ( 1 === selectedElements.length && selectedElements[ 0 ].id === id ) {
					displayMoveable = true;
				}
				return (
					<Element key={ id } onClick={ handleSelectElement( id ) }>
						<Comp { ...rest } />
					</Element>
				);
			} ) }
			{ hasSelection && (
				<Selection { ...selectionProps } />
			) }
			{ displayMoveable && (
				<Moveable
					target={ document.querySelector( '.selection' ) }
					pinchThreshold={ 20 }
					draggable={ true }
					resizable={ true }
					rotatable={ true }
					onDrag={ ( { target, beforeTranslate } ) => {
						frame.translate = beforeTranslate;
						target.style.transform = `translate(${ beforeTranslate[ 0 ] }px, ${ beforeTranslate[ 1 ] }px)`;
					} }
					onDragStart={ ( { set } ) => {
						set( frame.translate );
					} }
					onDragEnd={ () => {
						setPropertiesOnSelectedElements( { x: selectionProps.x + frame.translate[ 0 ], y: selectionProps.y + frame.translate[ 1 ] } );
					} }
					onResizeStart={ ( { target, set, setOrigin, dragStart } ) => {
						// @todo
					} }
					onResize={ ( { target, width, height, drag } ) => {
						target.style.width = `${ width }px`;
						target.style.height = `${ height }px`;
						// @todo properly by setting frame, too.
					} }
					onResizeEnd={ () => {
						// @todo Set the correct width/height.
					} }
					onRotateStart={ ( { set } ) => {
						set( frame.rotate );
					} }
					onRotate={ ( { target, beforeRotate } ) => {
						frame.rotate = beforeRotate;
						target.style.transform = `rotate(${ beforeRotate }deg)`;
					} }
					onRotateEnd={ () => {
						setPropertiesOnSelectedElements( { rotationAngle: frame.rotate } );
					} }
				/>
			) }
		</Background>
	);
}

export default Page;

function getUnionSelection( list, padding = 0 ) {
	// Ignore multi-selection for now.
	if ( 1 === list.length ) {
		const { x, y, width, height, rotationAngle } = list[ 0 ];
		return {
			x: x - padding,
			y: y - padding,
			width: width + ( 2 * padding ),
			height: height + ( 2 * padding ),
			rotationAngle,
		};
	}
	// return x,y,width,height that will encompass all elements in list
	const { x1, y1, x2, y2, rotationAngle } = list
	// first convert x1,y1 as upper left and x2,y2 as lower right
		.map( ( { x, y, width, height } ) => ( { x1: x, y1: y, x2: x + width, y2: y + height } ) )
		// then reduce to a single object by finding lowest {x,y}1 and highest {x,y}2
		.reduce(
			( el, sum ) => ( {
				x1: Math.min( el.x1, sum.x1 ),
				y1: Math.min( el.y1, sum.y1 ),
				x2: Math.max( el.x2, sum.x2 ),
				y2: Math.max( el.y2, sum.y2 ),
			} ),
			{ x1: 1000, y1: 1000, x2: 0, y2: 0, angle: 0 },
		);

	// finally convert back to x,y,width,height and add padding
	return { x: x1 - padding, y: y1 - padding, width: x2 - x1 + ( 2 * padding ), height: y2 - y1 + ( 2 * padding ), rotationAngle };
}
