import React from 'react';
import Summary from '../containers/Summary';
import { toBackendPayload, toGraph } from '../static';
import { db } from '../static/db';

class ErrorBoundary extends React.Component {
  state = {
    hasError: false
  };

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  constructor(props) {
    super(props);
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <h1>Une erreur fatale est survenue, veuillez recharger TRISTAN.</h1>
      );
    }

    return this.props.children;
  }
}

function DemoSummary({databaseKey}) {
	const payload = toBackendPayload(db[databaseKey]);
	const { elements } = toGraph(payload);
	const { facts, victims, indictees, general } = payload;

	// TODO: add witnesses, others.
	return (
    <ErrorBoundary>
	<Summary
			elements={elements}
			summary={{
				entities: {
					victims,
					indictees
				},
				facts: facts,
				general: general
			}}
		/>

    </ErrorBoundary>
		);
}

export default DemoSummary;
