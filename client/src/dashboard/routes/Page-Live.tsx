import React, { PureComponent } from 'react'
import { connect } from 'react-redux'
import { State } from '../../types'
import { Dispatch, TeamList, MatchList, MatchSpecific } from '../types'

import {
  getActiveMatch,
  forceLoadMatches,
  addMatch,
  setMatchToLive,
  removeMatch
} from '../client'

import {
  setMatches
} from '../actions'

import {
  TeamSelectionModal,
  ConfirmModal,
  Layout,
  MatchTableRow,
  NewMatchTeam,
  ActiveMatch
} from '../components'

import {
  Icon,
  Grid,
  Header,
  Button,
  Table,
  Message,
  Dimmer,
  Loader
} from 'semantic-ui-react'

interface Props {
  dispatch: Dispatch,
  teams: TeamList[] | null,
  matches: MatchList[] | null
}

interface ComponentState {
  teamA: null | TeamList,
  teamB: null | TeamList,
  selectedId: 'a' | 'b' | null,
  teamSelectModalOpen: boolean,
  matchLiveModalOpen: boolean,
  matchDeleteModalOpen: boolean,
  activeMatch: MatchSpecific | null,
  activation: string | null
}

const getInitialState = () => ({
  teamA: null,
  teamB: null,
  selectedId: null,
  teamSelectModalOpen: false,
  matchLiveModalOpen: false,
  matchDeleteModalOpen: false,
  activeMatch: null,
  activation: null
})

class LivePage extends PureComponent<Props, ComponentState> {
  constructor (props: Props) {
    super(props)

    this.state = getInitialState()
  }

  _updateActiveMatch = () => getActiveMatch()
    .then(match => {
      const activeMatch: MatchSpecific = {
        _id: match._id,
        teamA: {
          ...match.teamA,
          players: match.teamAPlayers
        },
        teamB: {
          ...match.teamB,
          players: match.teamBPlayers
        },
        isLive: match.isLive
      }

      this.setState({
        activeMatch,
        activation: activeMatch ? activeMatch._id : null
      })
    })
    .catch(() => this.setState({ activeMatch: null, activation: null }))

  componentDidMount () {
    this._updateActiveMatch()
  }

  _openDeleteModal = (id: string) => () => this.setState({
    matchDeleteModalOpen: true,
    activation: id
  })

  _openLiveConfirmModal = (id: string | null) => () => this.setState({
    matchLiveModalOpen: true,
    activation: id
  })

  _closeDeleteModal = () => this.setState({
    matchDeleteModalOpen: false,
    activation: null
  })

  _closeChooseModal = () => this.setState({
    teamSelectModalOpen: false,
    selectedId: null
  })

  _closeLiveConfirmModal = () => this.setState({
    matchLiveModalOpen: false,
    activation: null
  })

  _openChooseModal = (id: 'a' | 'b') => () => {
    this.setState({
      selectedId: id,
      teamSelectModalOpen: true
    })
  }

  _resetFields = () => {
    return new Promise(resolve => {
      resolve(this.setState({
        teamA: null,
        teamB: null
      }))
    })
  }

  _forceLoad = () => forceLoadMatches()

  _addNewMatch = () => {
    const { teamA, teamB } = this.state
    const { dispatch, matches } = this.props

    if (teamA === null || teamB === null) {
      return
    }

    addMatch({ teamA, teamB })
      .then(match => {
        if (matches) {
          dispatch(setMatches([ ...matches, match ]))
        }
        this.setState({ teamA: null, teamB: null })
      })
      .catch(() => this.setState({
        teamA: null,
        teamB: null
      }))
  }

  _deleteMatch = () => {
    const { dispatch, matches } = this.props
    const { activation, activeMatch } = this.state
    if (activation) {
      removeMatch(activation)
        .then(() => {
          if (matches) {
            const c = matches.find(m => m._id === activation)
            dispatch(setMatches(
              matches.filter(m => m._id !== activation)
            ))
            this.setState({
              activeMatch: c && c.isLive ? null : activeMatch,
              matchDeleteModalOpen: false,
              activation: null
            })
          }
        })
        .catch(e => console.log(e))
    }
  }

  _setMatchToLive = () => {
    const { matches, dispatch } = this.props
    const { activation } = this.state
    if (activation) {
      setMatchToLive(activation)
        .then(match => {
          if (matches) {
            dispatch(setMatches(
              matches.map(m => m._id === match._id ? match : m)
            ))
          }
          this._updateActiveMatch()
          this.setState({
            matchLiveModalOpen: false
          })
        })
        .catch(e => console.log(e))
    }
  }

  _onSelectedTeam = (team: TeamList) => () => {
    const { selectedId } = this.state
    if (selectedId === null) {
      return
    }

    if (selectedId === 'a') {
      this.setState({
        teamA: team,
        teamSelectModalOpen: false
      })
    }
    else {
      this.setState({
        teamB: team,
        teamSelectModalOpen: false
      })
    }
  }

  render () {
    const {
      teamA,
      teamB,
      teamSelectModalOpen,
      matchLiveModalOpen,
      matchDeleteModalOpen,
      activeMatch,
      activation
    } = this.state

    const {
      teams,
      matches
    } = this.props

    return (
      <>
        <Layout
          section='Game'
          title='Live'
          icon='fire'
        >
          <Grid stackable>
            <Grid.Row>
              <Grid.Column width={11}>
                <div className='f-container-wrap'>
                  <Header as='h2'>
                    <Icon name='fire' />
                    <Header.Content>Live match</Header.Content>
                  </Header>
                  {activeMatch === null ? (
                    <Message
                      info
                      header='There is match currently live'
                      content='You can start match from "Current matches ready" tab.'
                    />
                  ) : (
                    <div className='current-game'>
                      <ActiveMatch
                        team={activeMatch.teamA}
                        teamClass='a'
                      />
                      <div className='vs'>
                        <div>
                          <span>VS</span>
                        </div>
                      </div>
                      <ActiveMatch
                        team={activeMatch.teamB}
                        teamClass='b'
                      />
                    </div>
                  )}
                </div>
              </Grid.Column>
              <Grid.Column width={5}>
                <div className='f-container-wrap'>
                  <Header as='h2'>
                    <Icon name='fire' />
                    <Header.Content>Live match actions</Header.Content>
                  </Header>
                  {activeMatch !== null && (
                    <div className='actions-container'>
                      <Button
                        fluid
                        color='google plus'
                        onClick={this._forceLoad}
                      >Force load</Button>
                      <Button
                        fluid
                        color='instagram'
                        onClick={this._openLiveConfirmModal(activation)}
                      >Unload match</Button>
                    </div>
                  )}
                </div>
              </Grid.Column>
            </Grid.Row>
            <Grid.Row>
              <Grid.Column>
                <div className='f-container-wrap'>
                  <Header as='h2'>
                    <Icon name='time' />
                    <Header.Content>Current matches ready</Header.Content>
                  </Header>
                  {matches === null ? (
                    <Dimmer active inverted>
                      <Loader inverted content='Loading Matches' />
                    </Dimmer>
                  ) : matches.length <= 0 ? (
                    <Message
                      info
                      header='There is no matches'
                      content='Add more matches down below'
                    />
                  ) : (
                    <Table basic='very' celled>
                      <Table.Header>
                        <Table.Row>
                          <Table.HeaderCell>Team A</Table.HeaderCell>
                          <Table.HeaderCell>Team B</Table.HeaderCell>
                          <Table.HeaderCell>Actions</Table.HeaderCell>
                        </Table.Row>
                      </Table.Header>
                      <Table.Body>
                        {matches.map(match => {
                          return (
                            <MatchTableRow
                              key={match._id}
                              match={match}
                              onDeleteModal={this._openDeleteModal}
                              onEditModal={() => () => null}
                              onLiveModal={this._openLiveConfirmModal}
                            />
                          )
                        })}
                      </Table.Body>
                    </Table>
                  )}
                </div>
              </Grid.Column>
            </Grid.Row>
            <Grid.Row>
              <Grid.Column>
                <div className='f-container-wrap'>
                  <Header as='h2'>
                    <Icon name='gamepad' />
                    <Header.Content>Add new match</Header.Content>
                  </Header>
                  <div className='new-match'>
                    <NewMatchTeam
                      teamClass='a'
                      team={teamA}
                      onClick={this._openChooseModal('a')}
                    />
                    <div className='vs'>
                      <div className='margin-bottom-default'>
                        <span>VS</span>
                      </div>
                      <div className='margin-top-default'>
                        <Button
                          positive
                          disabled={(teamA === null || teamB === null)}
                          onClick={this._addNewMatch}
                        >Save match</Button>
                        {(teamA !== null || teamB !== null) && (
                          <Button
                            color='yellow'
                            className='margin-top-min'
                            onClick={this._resetFields}
                          >Reset</Button>
                        )}
                      </div>
                    </div>
                    <NewMatchTeam
                      teamClass='b'
                      team={teamB}
                      onClick={this._openChooseModal('b')}
                    />
                  </div>
                </div>
              </Grid.Column>
            </Grid.Row>
          </Grid>
        </Layout>
        {teamSelectModalOpen && (
          <TeamSelectionModal
            isOpen={teamSelectModalOpen}
            onClose={this._closeChooseModal}
            onSelected={this._onSelectedTeam}
            teams={teams}
          />
        )}
        {matchDeleteModalOpen && (
          <ConfirmModal
            modalHeader='Delete match'
            modalBody='Are you sure you want to delete this match'
            isOpen={matchDeleteModalOpen}
            onClose={this._closeDeleteModal}
            onDelete={this._deleteMatch}
          />
        )}
        {matchLiveModalOpen && (
          <ConfirmModal
            modalHeader='Set match to (un)live'
            modalBody='Are you sure you want to set this match to (un)live.'
            isOpen={matchLiveModalOpen}
            onClose={this._closeLiveConfirmModal}
            onDelete={this._setMatchToLive}
          />
        )}
      </>
    )
  }
}

const mapStateToProps = (state: State) => ({
  teams: state.dashboard.teams,
  matches: state.dashboard.matches
})

export default connect(mapStateToProps)(LivePage)