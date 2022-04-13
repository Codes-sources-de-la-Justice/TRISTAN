import React, { ReactNode, ReactEventHandler } from 'react'

export type EntityCardProps = {
	children: ReactNode;
	onClick: ReactEventHandler;
	hidden: boolean;
	selected: boolean;
};

type EntityHeaderProps = {
	left: ReactNode;
	right: ReactNode;
};


export function EntityCard({children, onClick, hidden, selected}: EntityCardProps) {
	return (
		<div className={`entity-card${hidden ? ' hidden' : ''}${selected ? ' selected' : ''}`} onClick={onClick}>
			{children}
		</div>
	);
}

export function EntityHeader({left, right}: EntityHeaderProps) {
	return (
		<div className="entity-header">
			<div className="entity-header__left">
				{left}
			</div>
			<div className="entity-header__right">
				{right}
			</div>
		</div>
	);
}
