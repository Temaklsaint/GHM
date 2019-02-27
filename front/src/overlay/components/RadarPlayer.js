// @flow
import React, { PureComponent } from 'react'
import { connect } from 'react-redux'

import type { State } from '../../types'
import type { Teams } from '../types'

type Props = {
  PlayerNumber: number,
  PlayerTeam: Teams,
  PlayerPosX: number,
  PlayerPosY: number,
  PlayerDead: boolean
}

type ComponentState = {
  deathPosX: number,
  deathPosY: number
}

class Radar extends PureComponent<Props, ComponentState> {
  state = {
    deathPosX: -30,
    deathPosY: -30
  }

  _calculateXPosition = () => {
    const { PlayerPosX } = this.props
    const scale = 0.07290
    const prefix = 224

    if (isNaN(PlayerPosX)) return
    if (PlayerPosX < 0) {
      return (Math.abs(PlayerPosX) * (-scale)) + prefix
    } else {
      return (PlayerPosX * scale) + prefix
    }
  }

  _calculateYPosition = () => {
    const { PlayerPosY } = this.props
    const scale = -0.07300
    const prefix = 254

    if (isNaN(PlayerPosY)) return
    if (PlayerPosY < 0) {
      return (Math.abs(PlayerPosY) * (-scale)) + prefix
    } else {
      return (PlayerPosY * scale) + prefix
    }
  }

  componentWillUpdate (nextProp: Props) {
    // TODO: CHANGE THIS TO REDUX>
    const { PlayerDead } = this.props
    if (nextProp.PlayerDead === true && PlayerDead === false) {
      this.setState({
        deathPosX: this._calculateXPosition(),
        deathPosY: this._calculateYPosition()
      })
    }
  }

  render () {
    const { PlayerNumber, PlayerTeam, PlayerDead } = this.props
    return (
      <div
        className={`radar-player ${PlayerTeam} ${PlayerDead ? 'dead' : ''}`}
        style={{
          left: PlayerDead ? this.state.deathPosX : this._calculateXPosition(),
          top: PlayerDead ? this.state.deathPosY : this._calculateYPosition()
        }}
      >
        <span>{PlayerNumber}</span>
      </div>
    )
  }
}

const mapStateToProps = (state: State) => ({

})

export default connect(mapStateToProps)(Radar)
