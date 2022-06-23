import React, { ReactNode, ReactEventHandler } from 'react'
import styled from 'styled-components';

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

export const EntityCard = styled.div<EntityCardProps>`
	padding: 5px 10px;
	border: 1px solid #000000;
  border-bottom: 3px solid #000000;
  max-width: 350px;
  cursor: pointer;
	display: ${props => props.hidden ? "none" : "default"};
	border-color: ${props => props.selected ? "blue" : "default"};

	h6 {
		font-weight: bold;
		margin: 0;
	}
`;

const StyledEntityHeader = styled.div`
	display: flex;
`;

const Left = styled.div`
	margin-right: auto;
`;

const Right = styled.div`
	margin-left: auto;
`;

export function EntityHeader({left, right}: EntityHeaderProps) {
	return (
		<StyledEntityHeader>
			<Left>
				{left}
			</Left>
			<Right>
				{right}
			</Right>
		</StyledEntityHeader>
	);
}
