import React, { useState, useCallback } from "react";

import { Tag, Badge } from '@dataesr/react-dsfr';
import UserIcon from 'remixicon-react/UserLineIcon';
import MapPinIcon from 'remixicon-react/MapPinLineIcon';
import TimeIcon from 'remixicon-react/TimeLineIcon';

import { getClosedNeighborWithDepth } from '../static';
import Joyride from 'react-joyride'

import { ROLES } from '../static';

import './Summary.css';

const prettyRoles = {
	[ROLES.VICTIM]: "victime",
	[ROLES.INDICTEE]: "mec",
	[ROLES.WITNESS]: "témoin",
	[ROLES.OTHER]: "inconnu"
};

function deriveAgeFromDOB(dob) {
	const [day, month, year] = dob.split("/");
	const msDelta = new Date() - new Date(year, month, day);
	return Math.floor(msDelta / (1000 * 3600 * 24 * 365));
}

function EntityCard({children, onClick, hidden, selected}) {
	return (
		<div className={`entity-card${hidden ? ' hidden' : ''}${selected ? ' selected' : ''}`} onClick={onClick}>
			{children}
		</div>
	);
}

function EntityHeader({left, right}) {
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

function PersonInfo({person, level=1}) {
	const age = deriveAgeFromDOB(person.Naissance_Date);
	const showNatureEtatCivil = !!person.Nom_Marital;
	return (
		<>
			<h6>{person.Nom} {person.Prenom}</h6>
			{showNatureEtatCivil && <p><i>{person.Nature_Etat_Civil} {person.Nom_Marital}</i></p>}
			{level >= 1 &&
					(<>
						<p>{age} ans (<i>{person.Naissance_Date}</i>) {age <= 18 && (<i className="warning">Mineur.e</i>)}</p>
						<p>{person.Profession['#text']}</p>
					</>)
			}
			{level >= 2 &&
					(<>
						<p>{person.Nationalite["#text"]} ({person.Naissance_Lieu} {person.CP_Commune_Naissance})</p>
						<p>{person.Adresse}</p>
						<p>{person.Commune_Residence} {person.CP_Commune_Residence}</p>
					</>)
			}
		</>
	);
}

function ListOfLinks({list, empty=null}) {
	if (!list || !list.map) return empty;
	return (
			<>
				{list.map(({Lien, Valeur}) => (<a href={Lien}>{Valeur}</a>)).reduce((prev, cur) => [prev, ', ', cur])}
			</>
	);
}

function FactInfo({fact, level=1}) {
	console.log(fact);
	return (
		<>
			<h6>{fact.Libelle}</h6>
			{level >= 1 &&
				(<>
					{fact.Libelle_Magistrat.Circonstances && <p>{fact.Libelle_Magistrat.Circonstances}</p>}
					<p><TimeIcon /> {fact.Periode_Affaire_Debut["#text"]} &gt; {fact.Periode_Affaire_Fin["#text"]}</p>
					<p><MapPinIcon /> {fact.Nature_Lieu["#text"]}</p>
				</>)
			}
			{level >= 2 &&
					(<>
						<p>Pour s'être trouvé à {fact.Libelle_Magistrat.Lieux.Lieu}, {fact.Libelle_Magistrat.Explication} </p>
						<p>Faits prévus par: <ListOfLinks list={fact.Libelle_Magistrat.Articles_Prevus.Article} empty={"aucun spécifié"} /> </p>
						<p>Faits réprimés par: <ListOfLinks list={fact.Libelle_Magistrat.Articles_Reprimes.Article} empty={"aucun spécifié"} /> </p>
					</>)
			}
		</>
	);
}

function FactCard({entity, onClick, hidden, selected}) {
	const handleClick = useCallback(() => onClick(entity));
	return (
		<EntityCard onClick={handleClick} hidden={hidden} selected={selected}>
			<EntityHeader
				left={(<p>{entity.Natinf} <i>{entity.Qualification}</i></p>)}
				right={(<Badge text='Faits' type='info' icon={false} />)}
			/>
			<FactInfo fact={entity} />
		</EntityCard>
	);
}

function PersonCard({entity, onClick, hidden, selected}) {
	const handleClick = useCallback(() => onClick(entity));
	const rightIconColor = entity.role === ROLES.VICTIM ? "yellow-tournesol" : undefined;
	// TODO: veuve/épou(x|se).
	// TODO: mineur.
	// TODO: representants.
	return (
		<EntityCard onClick={handleClick} hidden={hidden} selected={selected}>
			<EntityHeader
				left={(<UserIcon />)}
				right={(<Badge text={prettyRoles[entity.role]} type="warning" colorFamily={rightIconColor} icon={false} />)}
			/>
			<PersonInfo person={entity} />
		</EntityCard>
	);
}

function GridCard({Component, entities, onClick, hiddenIds, selectedId}) {
	return (
		<div className="grid-of-cards">
			{entities.map(entity => (<Component hidden={hiddenIds.includes(entity.Global_Id)} key={entity.Global_Id} entity={entity} onClick={onClick} selected={entity.Global_Id === selectedId} />))}
		</div>
	);
}

function Sidebar({open, entity, onClose}) {
	if (!open) return null;

	const entityType = entity.Natinf != null ? "fact" : "person";
	const entityInfo = entityType === "fact" ? (<FactInfo fact={entity} level={2} />) : (<PersonInfo person={entity} level={2} />);

	return (
		<div className="sidebar">
			<button onClick={onClose}>Fermer</button>
			{entityInfo}
		</div>
	);
}

function GeneralInfo({general: {Jonction, Depaysement, Scelles}, entities: { victims, indictees }, facts}) {
	// S'il existe un mineur, le montrer
	// Calculer atteintes aux biens -> NATAF?
	return (
		<>
			{Jonction && <Tag>Jonction</Tag>}
			{Depaysement && <Tag>Dépaysement</Tag>}
			{Scelles && <Tag>Présence de scellés</Tag>}
		</>
	);
}

function Summary({summary: {entities, facts, general}, elements}) {
	const [selectedEntity, selectEntity] = useState(null);
	const handleClose = useCallback(() => selectEntity(null));

	const [preferredIds, setPreferredIds] = useState([]);
	const hiddenIds = preferredIds.length > 0 ? [...entities, facts].flatMap(a => a.filter(n => !preferredIds.includes(n.Global_Id)).map(n => n.Global_Id)) : [];

	const handleEntityClick = entity => {
		selectEntity(entity);

		if (Object.is(selectedEntity, entity) && preferredIds.length > 0) {
			setPreferredIds([]);
		} else {
			const [_, neighbors] = getClosedNeighborWithDepth(entity.Global_Id, elements, 3)
			setPreferredIds(Array.from(neighbors));
		}
	};

	const steps = [
		{
			target: '.summary',
			content: 'Bienvenue dans votre visualisation de synthèse',
			placementBeacon: 'top'
		},
		{
			target: '.entity-card',
			content: 'Vous trouverez vos entités ici !',
			placementBeacon: 'top',
		}
	];

	const selectedId = preferredIds.length > 0 ? selectedEntity?.Global_Id : null;

	return (
		<div className="summary-container">
			<Joyride
				continuous
				showSkipButton
				showProgress
				debug
				locale={{
					back: 'Retour',
					close: 'Fermer',
					last: 'Fin',
					next: 'Suivant',
					open: 'Ouvrir la modale',
					skip: 'Passer'
				}}
				steps={steps} />
			<div className="summary">
				<div className="summary-header">
					<h1>Procédure</h1>
					<div className="summary-header__tags">
						<GeneralInfo entities={entities} general={general} />
					</div>
				</div>
				<div className="summary-body">
					<GridCard Component={FactCard} entities={facts} onClick={handleEntityClick} hiddenIds={hiddenIds} selectedId={selectedId} />
					<hr />
					{Object.values(entities)
							.map((subentities, index) => (
								<React.Fragment key={index}>
									<GridCard
										Component={PersonCard}
										entities={subentities}
										onClick={handleEntityClick} hiddenIds={hiddenIds} selectedId={selectedId} />
									<hr />
								</React.Fragment>
									))
					}
				</div>
			</div>
			<Sidebar open={selectedEntity != null} entity={selectedEntity} onClose={handleClose} />
		</div>
	);
}

export default Summary;
