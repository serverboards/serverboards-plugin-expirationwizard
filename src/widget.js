const {plugin, React, store, cache, Flash} = Serverboards
const plugin_id="serverboards.expiration"
import Timeline from './timeline'
const {Loading} = Serverboards.Components

const Model = React.createClass({
  getInitialState(){
    const state = store.getState()
    console.log(state)
    return {
      expirations: undefined,
      project: state.project.project,
      service_by_uuid: undefined
    }
  },
  componentDidMount(){
    plugin.start_call_stop("serverboards.expiration/command", "list_expirations", [])
      .then( (expirations) => this.setState( {expirations} ) )
      .catch( e => Flash.error(e) )
    cache.services().then( (services) => {
      let service_by_uuid={}
      services.map( (s) => service_by_uuid[s.uuid]=s )
      this.setState({service_by_uuid})
    })
  },
  handleShowService(serviceid){
    store.goto(`/project/${this.state.project.shortname}/services/${serviceid}`)
  },
  handleReload(){
    Flash.info("This will take long time")
    plugin.start_call_stop("serverboards.expiration/command", "update_expirations", [])
      .then( () => { Flash.info("Expiration updated"); this.componentDidMount() } )
      .catch( (e) => Flash.error(e) )
  },
  getServiceByUUID(uuid){
    return this.state.service_by_uuid[uuid]
  },
  render(){
    if (!this.state.expirations || !this.state.service_by_uuid)
      return (
        <Loading>Expirations</Loading>
      )
    return (
      <div className={`ui expirations ${this.props.layout}`}>
        <Timeline
          expirations={this.state.expirations}
          onShowService={this.handleShowService}
          getServiceByUUID={this.getServiceByUUID}
          />
        <button className="ui button yellow with icon" onClick={this.handleReload}>
          <i className="ui refresh icon"/>
        </button>

      </div>
    )
  }
})


function main(el, config, extra){
  let layout
  if (extra.layout.width==1 && extra.layout.height==2)
    layout="small"
  else if (extra.layout.width > extra.layout.height)
    layout="horizontal"
  else
    layout="vertical"

  Serverboards.ReactDOM.render(<Model {...config} layout={layout}/>, el)

  return function(){
    Serverboards.ReactDOM.unmountComponentAtNode(el)
  }
}

Serverboards.add_widget(`${plugin_id}/widget`, main)
