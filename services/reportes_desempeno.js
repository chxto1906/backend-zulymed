
const MongoLib = require("../lib/mongo");
const { ObjectId } = require("mongodb");
const chartExporter = require("highcharts-export-server");
const { dir } = require("console");

class ReportesDesempenoService {
  constructor() {
    this.mongoDB = new MongoLib();
  }

  async getNombreEvaluadoresYCargosPorUsuario(ids_quien_le_califica,_id_test){
    let result = { nombres: '', cargos: '' }
    for (let index = 0; index < ids_quien_le_califica.length; index++) {
        const user = ids_quien_le_califica[index];
        const usuario = await this.mongoDB.get('users',user.value,{nombre:1,apellido:1})
        const usuarioTest = await this.mongoDB.findOne('users_tests',{_id_test,_id_usuario:String(user.value)})
        const cargo = await this.mongoDB.get('cargos',usuarioTest._id_cargo,{nombre:1})
        if (index + 1 != ids_quien_le_califica.length){
            result['nombres'] = result['nombres'] + usuario.nombre + ' ' + usuario.apellido + ', '
            result['cargos'] = result['cargos'] + cargo.nombre + ', '
        }else{
            result['nombres'] = result['nombres'] + usuario.nombre + ' ' + usuario.apellido
            result['cargos'] = result['cargos'] +  cargo.nombre
        }
    }
    return result
  }

  async procesarCualitativas(tipo,element,datos){
    const preguntas = await this.mongoDB.obtenerCompetenciasCualitativas(tipo,datos._id_test)
    const respuestas = element ? await this.mongoDB.promedioCompetenciasCualitativas(tipo,datos._id_test,element._id_usuario,element._id_users_calificaron) : await this.mongoDB.promedioCompetenciasCualitativas(tipo,datos._id_test,null,null)
    let sumPromedio = 0
    let cualitativas = {items:[], sumPromedio, semaforo: null}
    for (let index = 0; index < preguntas.length; index++) {
        const pregunta = preguntas[index];
        const competencia = pregunta["_id"]
        const respuesta = respuestas[index];
        const cumplimiento = Math.round((respuesta.promedioRound * 100 / pregunta.nivel_requerido) * 100) / 100
        const semaforo = this.checkColorDesempeno(datos.semaforo_cualitativas,cumplimiento)
        const resultado = {competencia,cumplimiento,semaforo}
        cualitativas["items"].push(resultado)
        sumPromedio += cumplimiento
    }
    cualitativas["sumPromedio"] = Math.round((sumPromedio/preguntas.length) * 100) / 100 
    const resultado = this.checkColorDesempeno(datos.semaforo_cualitativas,cualitativas["sumPromedio"])
    cualitativas["semaforo"] = resultado
    return cualitativas
  }

  async procesarCuantitativas(tipo,element,datos){
    const indices = await this.mongoDB.getAll('preguntas',{_id_test:datos._id_test,tipo,delete:false},{},{_id:1})
    let sumPonderado = 0
    let cuantitativas = {items:[],sumPonderado,semaforo:null}
    for (let index = 0; index < indices.length; index++) {
        const indice = indices[index];
        /*const respuesta = await this.mongoDB.findOne('respuestas',{_id_test:datos._id_test,
            _id_user:element._id_usuario,_id_pregunta:String(indice._id),delete:false})*/
        const respuesta = element ? await this.mongoDB.promedioIndicadoresCuantitativas(tipo,datos._id_test,String(indice._id),element._id_usuario,element._id_users_calificaron,element.ids_users) : await this.mongoDB.promedioIndicadoresCuantitativas(tipo,datos._id_test,String(indice._id),null,null)
        const peso = indice.peso
        const meta = indice.meta
        const result = respuesta[0].promedioRound
        const cumplimiento = Math.round((result * 100 / meta) * 100) / 100
        const semaforo = this.checkColorDesempeno(datos.semaforo_cuantitativas,cumplimiento)
        let ponderado = (cumplimiento * peso) / 100
        ponderado = Math.round(ponderado * 100) / 100
        const resultado = {indicador:indice.indicador,peso,meta,result,ponderado,cumplimiento,semaforo}
        cuantitativas["items"].push(resultado)
        sumPonderado += ponderado
    }
    cuantitativas["sumPonderado"] = Math.round((sumPonderado) * 100) / 100
    const resultado = this.checkColorDesempeno(datos.semaforo_cuantitativas,cuantitativas["sumPonderado"])
    cuantitativas["semaforo"] = resultado
    return cuantitativas

  }

  checkColorDesempeno(semaforo,valor) {
    let resultado = {label: '',color:''}
    for (const item in semaforo) {
        if (valor >= semaforo[item].desde && valor <= semaforo[item].hasta){
          resultado = {valor,label:semaforo[item].label,color:semaforo[item].color}
          break
        }
    }
    return resultado
  }

  async procesarPonderacionFactoresPorUsuarioCualitativas(element,datos) {
    const especificas = await this.procesarCualitativas('cualitativas_especificas',element,datos)
    const generales = await this.procesarCualitativas('cualitativas_generales',element,datos)
    return {especificas,generales}
  }

  async procesarPonderacionFactoresPorCompetencias(test,datos) {
    const resultado = await this.procesarPonderacionFactoresPorUsuario(test,null,datos)
    return {generales:resultado.generales,especificas:resultado.especificas}
  } 
  
  async procesarPonderacionFactoresPorAreas(test,datos) {
    const _id_empresa = test._id_empresa
    const _id_test = String(test._id)
    let areas = await this.mongoDB.getAll('departamentos',{_id_empresa})
    let kpis = []
    let desempeno = []
    let generalesEspecificas = []
    for (let index = 0; index < areas.length; index++) {
      const element = areas[index];
      const _id_departamento = String(element._id)
      const resIdsUsers = await this.mongoDB.getAll('users_tests',{_id_test,_id_departamento,_id_empresa,delete:false},{_id_usuario:1})
      const ids_users = resIdsUsers.map(function(val) {
        return val._id_usuario
      }) || []
      if (ids_users.length > 0){
        const elem = {ids_users}
        const ponderacionFactores = await this.procesarPonderacionFactoresPorUsuario(test,elem,datos)
        let sumPromedioGeneralesEspecificas = (ponderacionFactores.generales.sumPromedio + ponderacionFactores.especificas.sumPromedio) / 2
        sumPromedioGeneralesEspecificas = Math.round(sumPromedioGeneralesEspecificas * 100) / 100
        const semaforo = this.checkColorDesempeno(datos.semaforo_cualitativas,sumPromedioGeneralesEspecificas)
        const itemsGeneralesEspecificas = ponderacionFactores.generales.items.concat(ponderacionFactores.especificas.items)
        generalesEspecificas.push({name:element.nombre,semaforo,items:itemsGeneralesEspecificas})
        kpis.push({area: element.nombre,semaforo: ponderacionFactores.kpis.semaforo})
        desempeno.push({area: element.nombre,semaforo: ponderacionFactores.desempeno.semaforo})
      }
    }
    return {kpis,desempeno,generalesEspecificas}
    
  }


  async procesarPonderacionFactoresPorUsuario(test,element,datos) {
    const kpis = await this.procesarCuantitativas('kpis',element,datos)
    const desempeno = await this.procesarCuantitativas('desempeno',element,datos)

    const especificas = await this.procesarCualitativas('cualitativas_especificas',element,datos)
    
    const generales = await this.procesarCualitativas('cualitativas_generales',element,datos)
    
    const kpis_peso = test.kpis_peso
    const desempeno_peso = test.desempeno_peso
    const competencias_especificas_peso = test.competencias_especificas_peso
    const competencias_generales_peso = test.competencias_generales_peso

    let kpis_ponderado = Math.round((kpis["sumPonderado"] * kpis_peso) * 100) / 100
    kpis_ponderado = kpis_ponderado / 100
    kpis_ponderado = Math.round(kpis_ponderado * 100) / 100

    let desempeno_ponderado = Math.round((desempeno["sumPonderado"] * desempeno_peso) * 100) / 100
    desempeno_ponderado = desempeno_ponderado / 100
    desempeno_ponderado = Math.round(desempeno_ponderado * 100) / 100

    let especificas_ponderado = Math.round((especificas["sumPromedio"] * competencias_especificas_peso) * 100) / 100
    especificas_ponderado = especificas_ponderado / 100
    especificas_ponderado = Math.round(especificas_ponderado * 100) / 100

    let generales_ponderado = Math.round((generales["sumPromedio"] * competencias_generales_peso) * 100) / 100
    generales_ponderado = generales_ponderado / 100
    generales_ponderado = Math.round(generales_ponderado * 100) / 100

    let total = kpis_ponderado+desempeno_ponderado+especificas_ponderado+generales_ponderado
    //total = total / 100
    total = Math.round(total * 100) / 100 

    const resultado = this.checkColorDesempeno(datos.semaforo_cualitativas,total)

    return {kpis,desempeno,especificas,generales,kpis_peso,
        desempeno_peso,competencias_especificas_peso,competencias_generales_peso,
        kpis_ponderado,desempeno_ponderado,especificas_ponderado,generales_ponderado,resultado}
  }


  async procesarDatosJefesParesSubordinados(element,datos) {
    let resultado = []
    let headers = []
    let sumPromedioGenerales = 0
    let sumPromedioEspecificas = 0
    let cont = 0
    if (element.hasOwnProperty('_ids_jefes') ){
      const jefes = element._ids_jefes
      for (let index = 0; index < jefes.length; index++) {
        const jefe = jefes[index];
        let elem = {_id_usuario: element._id_usuario, _id_users_calificaron: jefe.value}
        const res = await this.procesarPonderacionFactoresPorUsuarioCualitativas(elem,datos)
        sumPromedioGenerales+=res.generales.sumPromedio
        sumPromedioEspecificas+=res.especificas.sumPromedio
        cont++
        resultado.push(res)
        if (jefes.length == 1)
          headers.push("Jefe")
        else
          headers.push("Jefe "+(index+1))
      }
    }
    if (element.hasOwnProperty('_ids_pares') ){
      const pares = element._ids_pares
      for (let index = 0; index < pares.length; index++) {
        const par = pares[index];
        let elem = {_id_usuario: element._id_usuario, _id_users_calificaron: par.value}
        const res = await this.procesarPonderacionFactoresPorUsuarioCualitativas(elem,datos)
        sumPromedioGenerales+=res.generales.sumPromedio
        sumPromedioEspecificas+=res.especificas.sumPromedio
        cont++
        resultado.push(res)
        if (pares.length == 1)
          headers.push("Par")
        else
          headers.push("Par "+(index+1))
      }
    }
    if (element.hasOwnProperty('_ids_subordinados') ){
      const subordinados = element._ids_subordinados
      for (let index = 0; index < subordinados.length; index++) {
        const subordinado = subordinados[index];
        let elem = {_id_usuario: element._id_usuario, _id_users_calificaron: subordinado.value}
        const res = await this.procesarPonderacionFactoresPorUsuarioCualitativas(elem,datos)
        sumPromedioGenerales+=res.generales.sumPromedio
        sumPromedioEspecificas+=res.especificas.sumPromedio
        cont++
        resultado.push(res)
        if (subordinados.length == 1)
          headers.push("Subordinado")
        else
          headers.push("Subordinado "+(index+1))
      }
    }

    const promedioGenerales = sumPromedioGenerales / cont
    const totalGenerales = Math.round((promedioGenerales) * 100) / 100

    const promedioEspecificas = sumPromedioEspecificas / cont
    const totalEspecificas = Math.round((promedioEspecificas) * 100) / 100

    const semaforoTotalGenerales = this.checkColorDesempeno(datos.semaforo_cualitativas,totalGenerales)
    const semaforoTotalEspecificas = this.checkColorDesempeno(datos.semaforo_cualitativas,totalEspecificas)

    return {headers,resultado,semaforoTotalGenerales,semaforoTotalEspecificas}
  }

  async procesarDatosEvaluador(test,element,datos) {
    const usuario = await this.mongoDB.get('users',element._id_usuario,{nombre:1,apellido:1})
    const nombreUsuario = `${usuario.nombre} ${usuario.apellido}`
    const cargo = await this.mongoDB.get('cargos',element._id_cargo,{nombre:1})
    const nombreCargo = cargo.nombre
    const departamento = await this.mongoDB.get('departamentos',element._id_departamento,{nombre:1})
    const nombreDepartamento = departamento.nombre
    const tiempo = element.antiguedad + " mes/es"
    const periodo = test.periodo
    const evaluadores = await this.getNombreEvaluadoresYCargosPorUsuario(element._ids_quien_le_califica,datos._id_test)
    const nombreEvaluadoresCuantitativas = evaluadores["nombres"]
    const cargosEvaluadoresCuantitativas = evaluadores["cargos"]

    let nombreEvaluadoresJefes = ''
    let cargosEvaluadoresJefes = ''
    let nombreEvaluadoresPares = ''
    let cargosEvaluadoresPares = ''
    let nombreEvaluadoresSubordinados = ''
    let cargosEvaluadoresSubordinados = ''
    if (element.hasOwnProperty('_ids_jefes') ){
      let evaluadoresCualitativasJefes = await this.getNombreEvaluadoresYCargosPorUsuario(element._ids_jefes,datos._id_test)
      nombreEvaluadoresJefes = evaluadoresCualitativasJefes["nombres"]
      cargosEvaluadoresJefes = evaluadoresCualitativasJefes["cargos"]
    }
    if (element.hasOwnProperty('_ids_pares') ){
      let evaluadoresCualitativasPares = await this.getNombreEvaluadoresYCargosPorUsuario(element._ids_pares,datos._id_test)
      nombreEvaluadoresPares = evaluadoresCualitativasPares["nombres"]
      cargosEvaluadoresPares = evaluadoresCualitativasPares["cargos"]
      if (nombreEvaluadoresJefes.length > 0){
        nombreEvaluadoresPares = ", "+nombreEvaluadoresPares
        cargosEvaluadoresPares = ", "+cargosEvaluadoresPares
      }
    }
    if (element.hasOwnProperty('_ids_subordinados') ){
      let evaluadoresCualitativasSubordinados = await this.getNombreEvaluadoresYCargosPorUsuario(element._ids_subordinados,datos._id_test)
      nombreEvaluadoresSubordinados = evaluadoresCualitativasSubordinados["nombres"]
      cargosEvaluadoresSubordinados = evaluadoresCualitativasSubordinados["cargos"]
      if (nombreEvaluadoresPares.length > 0){
        nombreEvaluadoresSubordinados = ", "+nombreEvaluadoresSubordinados
        cargosEvaluadoresSubordinados = ", "+cargosEvaluadoresSubordinados
      }
    }

    const nombreEvaluadoresCualitativas = nombreEvaluadoresJefes + nombreEvaluadoresPares + nombreEvaluadoresSubordinados
    const cargosEvaluadoresCualitativas = cargosEvaluadoresJefes + cargosEvaluadoresPares + cargosEvaluadoresSubordinados

    return { nombreUsuario,nombreCargo,nombreDepartamento,tiempo,periodo,
      nombreEvaluadoresCuantitativas,cargosEvaluadoresCuantitativas,
      nombreEvaluadoresCualitativas,cargosEvaluadoresCualitativas }
  }

  procesarPorCompetencia(datosObtenidos, datos, tipo='generales') {
    let competencias = []
    for (let index = 0; index < datosObtenidos.resultado[0][tipo].items.length; index++) {
      let sumTotal = 0
      let respuesta = {competencia:{title: null, semaforo: {}},data:[]}
      for (let index2 = 0; index2 < datosObtenidos.resultado.length; index2++) {
        const item = datosObtenidos.resultado[index2][tipo].items[index];
        respuesta['competencia']['title'] = item['competencia']
        respuesta['data'].push({name:datosObtenidos.headers[index2],y:item.cumplimiento,color:item.semaforo.color})
        sumTotal+=item.cumplimiento
      }
      let total = sumTotal / datosObtenidos.resultado.length
      total = Math.round((total) * 100) / 100
      const semaforo = this.checkColorDesempeno(datos.semaforo_cualitativas,total)
      respuesta['competencia']['semaforo'] = semaforo
      competencias.push(respuesta)
    }
    return competencias
  }


  async generateDataDesempenoGeneral(datos) {
    const test = await this.mongoDB.get('tests',datos._id_test)
    const data =  {
        _id: datos._id_test,
        cualitativas: await this.procesarPonderacionFactoresPorCompetencias(test,datos),
        cuantitativas: await this.procesarPonderacionFactoresPorAreas(test,datos),
        semaforo_cualitativas: datos.semaforo_cualitativas,
        semaforo_cuantitativas: datos.semaforo_cuantitativas,
    }
    await this.mongoDB.deleteFisicamente('reportes',{_id:datos._id_test})
    await this.mongoDB.create('reportes',data)
    const resultado = await this.mongoDB.getNoObject('reportes',datos._id_test)

    return resultado

  }


  async generateDataDesempenoEspecifico(datos) {
    const test = await this.mongoDB.get('tests',datos._id_test)
    let datosEvaluadores = []
    const usuariosTests = await this.mongoDB.getAll('users_tests',{_id_test:String(datos._id_test),_id_usuario:datos._id_usuario,delete:false})
    for (let index = 0; index < usuariosTests.length; index++) {
        const element = usuariosTests[index];
        const evaluador = await this.procesarDatosEvaluador(test,element,datos)
        const ponderacionFactores = await this.procesarPonderacionFactoresPorUsuario(test,element,datos)
        const jefesParesSubordinados = await this.procesarDatosJefesParesSubordinados(element,datos)
        const porCompetenciaGenerales = this.procesarPorCompetencia(jefesParesSubordinados,datos,'generales')
        const porCompetenciaEspecificas = this.procesarPorCompetencia(jefesParesSubordinados,datos,'especificas')
        datosEvaluadores.push({evaluador,ponderacionFactores,jefesParesSubordinados,
          porCompetenciaGenerales,porCompetenciaEspecificas})
    }
    return datosEvaluadores
  }

  generateBase64Chart = (options) => {
    return new Promise((resolve, reject) => {
      chartExporter.export(options, (err, resp) => {
        if (err) {
            return reject(err)
        }
        const image64 = resp.data;
        const filename = resp.filename;
        
        resolve(filename)
        
      })
    })
  }

  getOptionsPonderacionFactores(data,num) {
    return {
        type: "svg",
        outfile: `public/graficos/desempeno/dataPonderacionEspecifico${num}.svg`,
        options: {
            chart: {
                type: 'solidgauge',
                height: 270
              },
              credits: {
                enabled: false
              },
              subtitle: {
                 text:"Total Factores Cuantitativos + Cualitativos",
                style: {
                  fontSize:"1.5em",
                  color: "#000000"
                },
                y:60
              },
              title: {
                text: "PONDERACIÓN DE FACTORES",
                style: {
                  fontSize:"2em",
                  color: "#000000"
                },
                y:40
              },
              tooltip: {
                enabled: false
              },
            
              pane: {
                center: ['50%', '50%'],
                size: '180px',
                startAngle: 0,
                endAngle: 360,
                background: {
                  backgroundColor: '#eaeaea',
                  innerRadius: '70%',
                  outerRadius: '100%',
                  borderWidth: 0
                }
              },
            
              yAxis: {
                min: 0,
                max: 100,
                labels: {
                  enabled: false
                },
            
                lineWidth: 0,
                minorTickInterval: null,
                tickPixelInterval: 400,
                tickWidth: 0
              },
            
              plotOptions: {
                solidgauge: {
                  innerRadius: '70%',
                  dataLabels: {
                    enabled: true,
                    format: '{y} %',
                    borderColor: "transparent",
                    style: {
                      fontSize: '2.5em'
                    },
                    y:-25
                  }
                }
              },
            
              series: [{
                name: "PONDERACIÓN DE FACTORES",
                data: [{
                  color:data.resultado.color,
                  y:data.resultado.valor
                }]
              }]
        }
    }
  }

  getOptionsBarraResultadosPorTipo(tipo,max,semaforo,num) {
    const resto = max - semaforo.valor
    return {
        type: "svg",
        outfile: `public/graficos/desempeno/dataBarraPorTipoEspecifico${num}.svg`,
        options: {
            chart: {
                type: 'bar',
                height: 80
              },
              credits:{
                enabled: false
              },
              title: {
                text: ''
              },
              xAxis: {
                categories: [tipo],
                visible: false
              },
              yAxis: {
                min: 0,
                max: max,
                title: {
                  text: ''
                },
                visible: false
              },
              legend: false,
              plotOptions: {
                series: {
                  stacking: 'normal',
                  
                }
              },
              series: [{
                name: 'Resto',
                data: [resto],
                color: "#efefef"
              }, {
                name: tipo,
                data: [semaforo.valor],
                color: semaforo.color
              }]
        }
    }
  }

  getOptionsBarraCumplimientoPorTipo(items,tipo,max,num) {
    const categorias = items.map(function(it) {
        return tipo == 'cuantitativas' ? it.indicador : it.competencia
    })
    const valores = items.map(function(it) {
        return {y: it.semaforo.valor, color: it.semaforo.color}
    })
    return {
        type: "svg",
        outfile: `public/graficos/desempeno/dataBarraCumplimientoPorTipoEspecifico${num}.svg`,
        options: {
            chart: {
                type: 'bar',
                height: 268
              },
              credits:{
                enabled:false
              },
              title: {
                text: 'Porcentaje de Cumplimiento',
                style: {
                    fontSize:"1.2em"
                }
              },
              xAxis: {
                categories: categorias,
                labels:{
                    style: {
                      fontSize:"0.7em"
                    }
                }
              },
              yAxis: {
                min: 0,
                max: max,
                tickInterval: 10,
                title: {
                  text: ''
                },
                labels: {
                  formatter: function() {
                    return this.value + '%';
                  },
                  style: {
                    fontSize:"0.7em"
                  }
                }
              },
              legend: false,
              plotOptions: {
                series: {
                  stacking: 'normal'
                }
              },
              series: [{
                name: 'Cumplimientos',
                data: valores
              }]
        }
    }
  }

  getOptionsResultadoObtenido(data,num,subtitle="Resultado obtenido",title='') {
    return {
        type: "svg",
        outfile: `public/graficos/desempeno/dataResultadoObtenido${num}.svg`,
        options: {
            chart: {
                type: 'solidgauge',
                height: 166,
                margin: 0
              },
              credits: {
                enabled: false
              },
              title: {
                text: title,
                y: -1,
                style: {
                  fontSize:"1em",
                  color: "#000000"
                },
              },
              subtitle: {
                text: subtitle,
                style: {
                  fontSize:"1em",
                  color: "#000000"
                },
                y:130
              },
              tooltip: {
                enabled: false
              },
            
              pane: {
                center: ['50%', '40%'],
                size: '110px',
                startAngle: 0,
                endAngle: 360,
                background: {
                  backgroundColor: '#eaeaea',
                  innerRadius: '70%',
                  outerRadius: '100%',
                  borderWidth: 0
                }
              },
            
              yAxis: {
                min: 0,
                max: 100,
                labels: {
                  enabled: false
                },
            
                lineWidth: 0,
                minorTickInterval: null,
                tickPixelInterval: 400,
                tickWidth: 0
              },
            
              plotOptions: {
                solidgauge: {
                  innerRadius: '70%',
                  dataLabels: {
                    enabled: true,
                    format: '{y} %',
                    borderColor: "transparent",
                    style: {
                      fontSize: '1.5em'
                    },
                    y:-16
                  }
                }
              },
            
              series: [{
                name: title,
                data: [{
                  color:data.color,
                  y:data.valor
                }]
              }]
        }
    }
  }

  getOptionsResumenTipoEvaluadores(data,num) {
    return {
      type: "svg",
      outfile: `public/graficos/desempeno/dataResumenTipoEvaluadores${num}.svg`,
      options: {
        chart: {
          type: 'column'
        },
        credits:{
          enabled: false
        },
        title: {
          text: 'Resumen por tipo de evaluadores'
        },
        accessibility: {
          announceNewData: {
            enabled: true
          }
        },
        xAxis: {
          type: 'category',
          
        },
        yAxis: {
          title: '',
          tickInterval: 50,
          min: 0,
          max: 100,
          labels: {
            formatter: function() {
              return this.value + '%';
            }
          }
        },
        legend: {
          enabled: false
        },
        plotOptions: {
          series: {
            borderWidth: 0,
            dataLabels: {
              enabled: true,
              format: '{point.y:.1f}%'
            }
          }
        },
        series: [
          {
            data: data
            
            /*[
              {
                name: "Chrome",
                y: 62.74,
                color: "#efefef"
              },
              {
                name: "Firefox",
                y: 10.57,
                color: "#00efff"
              },
              {
                name: "Internet Explorer",
                y: 7.23,
                color: "#00ef00"
              },
              {
                name: "Safari",
                y: 5.58,
                color: "#ccef00"
              },
              {
                name: "Edge",
                y: 4.02,
                color: "#ccef00"
              },
              {
                name: "Opera",
                y: 1.92,
                color: "#ccef00"
              },
              {
                name: "Other",
                y: 7.62,
                color: "#ccef00"
              }
            ]*/
          }
        ]
      }
    }
  }

  procesarDatosPorCompetencias(datos,num2){
    const that = this
    let num = 0;
    return Promise.all(
      datos.map(async (item) => {
        num++
        return Promise.all([
            that.generateBase64Chart(that.getOptionsResultadoObtenido(item.competencia.semaforo,item.competencia.title+"_total_"+num+"_"+num2,"Resultado",item.competencia.title.toUpperCase())),
            that.generateBase64Chart(that.getOptionsResumenTipoEvaluadores(item.data,item.competencia.title+"_por_competencia_"+num+"_"+num2))
        ]).then(datos => {
            return {
                dataResultadoCompetenciaTotal:datos[0],
                dataResultadoCompetencia:datos[1]
            }

        }).catch(err => console.log("ERROR en procesarDatosPorCompetencias: "+err.message))
        
      })
    )
  }


  processGenerateBase64ChartPorArea(datos) {
    const that = this
    let num = 0;
    let items = datos
    return Promise.all(
      items.map(async (item) => {
        num++
        return Promise.all([
            that.generateBase64Chart(that.getOptionsPonderacionFactoresGeneralAreas(item.semaforo,item.name,item.name+'_'+num)),
        ]).then(datos => {
            return {
                items: item.items,
                dataAreas: datos[0]
            }

        }).catch(err => console.log("ERROR en processGenerateBase64ChartPorArea: "+err.message))
        
      })
    )
  }

  processGenerateBase64ChartPorEvaluador(datos) {
      
    const that = this
    let num = 0;
    //console.dir(datos)
    let items = datos.data
    return Promise.all(
      items.map(async (item) => {
        //console.dir(item)
          num++
        return Promise.all([
            that.generateBase64Chart(that.getOptionsPonderacionFactores(item.ponderacionFactores,"ponderacion_factor_usuario_"+num)),
            that.generateBase64Chart(that.getOptionsBarraResultadosPorTipo('KPIS',datos.semaforo_cuantitativas.optimo.hasta,
            item.ponderacionFactores.kpis.semaforo,"barra_kpis_usuario_"+num)),
            that.generateBase64Chart(that.getOptionsBarraResultadosPorTipo('Desempeño Social',datos.semaforo_cuantitativas.optimo.hasta,
            item.ponderacionFactores.desempeno.semaforo,"barra_desempeno_usuario_"+num)),
            that.generateBase64Chart(that.getOptionsBarraResultadosPorTipo('Competencias Generales',datos.semaforo_cualitativas.excelente.hasta,
            item.ponderacionFactores.generales.semaforo,"barra_generales_usuario_"+num)),
            that.generateBase64Chart(that.getOptionsBarraResultadosPorTipo('Competencias Específicas',datos.semaforo_cualitativas.excelente.hasta,
            item.ponderacionFactores.especificas.semaforo,"barra_especificas_usuario_"+num)),
            that.generateBase64Chart(that.getOptionsResultadoObtenido(item.ponderacionFactores.kpis.semaforo,"kpis_"+num,"Resultado obtenido")),
            that.generateBase64Chart(that.getOptionsResultadoObtenido(item.ponderacionFactores.desempeno.semaforo,"desempeno_"+num,"Resultado obtenido")),
            that.generateBase64Chart(that.getOptionsResultadoObtenido(item.ponderacionFactores.generales.semaforo,"generales_"+num,"Resultado obtenido")),
            that.generateBase64Chart(that.getOptionsResultadoObtenido(item.ponderacionFactores.especificas.semaforo,"especificas_"+num,"Resultado obtenido")),
            that.generateBase64Chart(that.getOptionsBarraCumplimientoPorTipo(item.ponderacionFactores.kpis.items,'cuantitativas',datos.semaforo_cuantitativas.optimo.hasta,"kpis_"+num)),
            that.generateBase64Chart(that.getOptionsBarraCumplimientoPorTipo(item.ponderacionFactores.desempeno.items,'cuantitativas',datos.semaforo_cuantitativas.optimo.hasta,"desempeno_"+num)),
            
            that.generateBase64Chart(that.getOptionsResultadoObtenido(item.jefesParesSubordinados.semaforoTotalGenerales,"generales_porevaluador_"+num,"Resultado obtenido")),
            that.procesarDatosPorCompetencias(item.porCompetenciaGenerales,num),

            that.generateBase64Chart(that.getOptionsResultadoObtenido(item.jefesParesSubordinados.semaforoTotalEspecificas,"especificas_porevaluador_"+num,"Resultado obtenido")),
            that.procesarDatosPorCompetencias(item.porCompetenciaEspecificas,num),

            
        ]).then(datos => {
            return {
                evaluador: item.evaluador,
                kpis: item.ponderacionFactores.kpis,
                desempeno: item.ponderacionFactores.desempeno,
                generales: item.ponderacionFactores.generales,
                especificas: item.ponderacionFactores.especificas,
                jefesParesSubordinados: item.jefesParesSubordinados,
                dataPonderacionFactores:datos[0],

                dataBarrasUsuarioKPIS:datos[1],
                dataBarrasUsuarioDESEMPENO:datos[2],
                dataBarrasUsuarioGENERALES:datos[3],
                dataBarrasUsuarioESPECIFICAS:datos[4],

                dataResultadoObtenidoKpis:datos[5],
                dataResultadoObtenidoDesempeno:datos[6],

                dataResultadoObtenidoGenerales:datos[7],
                dataResultadoObtenidoEspecificas:datos[8],

                dataBarraCumplimientoKpis: datos[9],
                dataBarraCumplimientoDesempeno: datos[10],

                dataResultadoObtenidoGeneralesPorEvaluador: datos[11],
                dataResultadoObtenidoGeneralesPorCompetenciaGeneral: datos[12],

                dataResultadoObtenidoEspecificasPorEvaluador: datos[13],
                dataResultadoObtenidoEspecificasPorCompetenciaGeneral: datos[14]

            }

        }).catch(err => console.log("ERROR en processGenerateBase64ChartPorEvaluador: "+err.message))
        
      })
    )
  }
 

  async generatePdfEspecifico (data,res,host) {
    const ejs = require("ejs");
    const pdf = require("html-pdf");
    const path = require("path");
    let test = await this.mongoDB.get('tests',data._id_test)
    const _id_empresa = test._id_empresa
    const empresa = await this.mongoDB.get('empresas',_id_empresa)

    const kpis_peso = test.kpis_peso
    const desempeno_peso = test.desempeno_peso
    const competencias_especificas_peso = test.competencias_especificas_peso
    const competencias_generales_peso = test.competencias_generales_peso

    const datosPesosDesempeno = {
        type: "svg",
        outfile: 'public/graficos/desempeno/datosPesosDesempeno.svg',
        options: {
            chart: {
                type: 'bar',
                margin: 0,
                height: 190
              },
              credits: {
                enabled: false
              },
              title: {
                text: 'Pesos'
              },
              xAxis: {
                categories: ['Pesos'],
                visible: false,
            
              },
              yAxis: {
                min: 0,
                max: 100,
                title: {
                  text: false
                },
                visible: false
              },
              legend: {
                reversed: true
              },
              plotOptions: {
                series: {
                  stacking: 'normal',
                  dataLabels: {
                    enabled: true,
                    format: '<b>{point.y:.2f} %</b>'
                  },
                }
              },
              series: [{
                name: 'Competencias Específicas',
                data: [competencias_especificas_peso],
                color: "#b3bedf"
              }, {
                name: 'Competencias Generales',
                data: [competencias_generales_peso],
                color: "#7991ce"
              }, {
                name: 'Desempeño Social',
                data: [desempeno_peso],
                color: "#3f6ab7"
              },
              {
                name: 'KPIS',
                data: [kpis_peso],
                color: "#335899"
              }]
        }
    }


    data.filepath = empresa.filepath
    data.host = host
    chartExporter.initPool({
      maxWorkers: 8,
      initialWorkers: 8,
      workLimit: 50,
      queueSize: 500
    });
    const that = this
    //console.dir(data)
    Promise.all([
        this.processGenerateBase64ChartPorEvaluador(data),
        this.generateBase64Chart(datosPesosDesempeno)
    ]).then(values => {
      chartExporter.killPool();
      data = Object.assign(data,{
        data:values[0],
        datosPesos: values[1],
        semaforo_cualitativas: data.semaforo_cualitativas,
        semaforo_cuantitativas: data.semaforo_cuantitativas,
        host:host
      })
      ejs.renderFile(path.join(__dirname, '/../views/', "reporte_desempeno_especifico.ejs"), data, (err, html) => {
        if (err) {
              res.send(err);
        } else {
            let options = {
                "height": "11.25in",
                "width": "8.5in",
                "header": {
                    "height": "0mm"
                },
                "footer": {
                    "height": "0mm",
                },
                "timeout": 60000
            };
            const filename = "reporte_desempeno_especifico_"+data._id_test+".pdf"
            const file = path.join(__dirname, '/../public/reportes/', filename)
            pdf.create(html, options).toFile(file, function (err, data) {
                if (err) {
                    console.log("Error create PDF");
                    console.dir(err)
                    res.status(400).json({
                        data: "",
                        message: "Error al generar PDF."
                    });
                } else {
                    res.status(201).json({
                        data: `${host}/public/reportes/${filename}`,
                        message: "PDF link Desempeno Específico."
                    });
                    
                }
            })
        }
      })
    }).catch(err => console.log("ERROR en generatePdfDesempeño: "+err.message))
  }

  getOptionsPonderacionFactoresGeneralAreas(semaforo,title,num) {
    return {
      type: "svg",
      outfile: `public/graficos/desempeno/dataResultadoPromedioArea_${num}.svg`,
      options: {
        chart: {
            type: 'solidgauge',
            height: 266,
            margin: 0
        },
        credits: {
            enabled: false
        },
        title: {
            text: title,
            y: 20,
            style: {
                fontSize:"2em",
                color: "#000000"
            },
        },
        subtitle: {
            text: 'Promedio del departamento',
            style: {
            fontSize:"1em",
            color: "#000000"
            },
            y:170
        },
        tooltip: {
            enabled: false
        },
        
        pane: {
            center: ['50%', '40%'],
            size: '110px',
            startAngle: 0,
            endAngle: 360,
            background: {
            backgroundColor: '#eaeaea',
            innerRadius: '70%',
            outerRadius: '100%',
            borderWidth: 0
            }
        },
        
        yAxis: {
            min: 0,
            max: 100,
            labels: {
            enabled: false
            },
        
            lineWidth: 0,
            minorTickInterval: null,
            tickPixelInterval: 400,
            tickWidth: 0
        },
        
        plotOptions: {
            solidgauge: {
            innerRadius: '70%',
            dataLabels: {
                enabled: true,
                format: '{y} %',
                borderColor: "transparent",
                style: {
                fontSize: '1.5em'
                },
                y:-16
            }
            }
        },
        
        series: [{
            name: '',
            data: [{
            color:semaforo.color,
            y:semaforo.valor
            }]
        }]
      }
    }
  }


  getOptionsPonderacionFactoresGeneral(semaforo,title,subtitle,aux) {
    return {
      type: "svg",
      outfile: `public/graficos/desempeno/dataResultadoPromedio_${aux}.svg`,
      options: {
        chart: {
            type: 'solidgauge',
            height: 166,
            margin: 0
        },
        credits: {
            enabled: false
        },
        title: {
            text: title,
            y: -1,
            style: {
            fontSize:"1em",
            color: "#000000"
            },
        },
        subtitle: {
            text: subtitle,
            style: {
            fontSize:"1em",
            color: "#000000"
            },
            y:130
        },
        tooltip: {
            enabled: false
        },
        
        pane: {
            center: ['50%', '40%'],
            size: '110px',
            startAngle: 0,
            endAngle: 360,
            background: {
            backgroundColor: '#eaeaea',
            innerRadius: '70%',
            outerRadius: '100%',
            borderWidth: 0
            }
        },
        
        yAxis: {
            min: 0,
            max: 100,
            labels: {
            enabled: false
            },
        
            lineWidth: 0,
            minorTickInterval: null,
            tickPixelInterval: 400,
            tickWidth: 0
        },
        
        plotOptions: {
            solidgauge: {
            innerRadius: '70%',
            dataLabels: {
                enabled: true,
                format: '{y} %',
                borderColor: "transparent",
                style: {
                fontSize: '1.5em'
                },
                y:-16
            }
            }
        },
        
        series: [{
            name: '',
            data: [{
              color:semaforo.color,
              y:semaforo.valor
            }]
        }]
      }
    }
  }

  async generatePdfDesempenoGeneral (datos,res,host) {
    const ejs = require("ejs");
    const pdf = require("html-pdf");
    const path = require("path");
    let data = await this.mongoDB.getNoObject('reportes',datos._id_test)
    data = Object.assign(data,datos)
    let test = await this.mongoDB.get('tests',data._id_test)
    const _id_empresa = test._id_empresa
    const empresa = await this.mongoDB.get('empresas',_id_empresa)
    data.filepath = empresa.filepath  
    data["host"] = host

    chartExporter.initPool({
        maxWorkers: 8,
        initialWorkers: 8,
        workLimit: 50,
        queueSize: 500,
        timeoutThreshold: 5000
    });
    const that = this
    Promise.all([
      this.generateBase64Chart(this.getOptionsPonderacionFactoresGeneral(data.cualitativas.generales.semaforo,'','Promedio de la compañía','competencias_generales')),
      this.generateBase64Chart(this.getOptionsPonderacionFactoresGeneral(data.cualitativas.especificas.semaforo,'','','competencias_especificas')),
      this.processGenerateBase64ChartPorArea(data.cuantitativas.generalesEspecificas),
    ]).then(values => {
        chartExporter.killPool();
        data = Object.assign(data,{
          resultadoCompetenciasGenerales: values[0],
          resultadoCompetenciasEspecificas: values[1],
          resultadoCuantitativasAreas: values[2],
          host:host
        })
        ejs.renderFile(path.join(__dirname, '/../views/', "reporte_desempeno_general.ejs"), data, (err, html) => {
            if (err) {
                res.send(err);
            } else {
                let options = {
                    "height": "11.25in",
                    "width": "8.5in",
                    "header": {
                        "height": "0mm"
                    },
                    "footer": {
                        "height": "0mm",
                    },
                };
                const filename = "reporte_desempeno_general_"+data._id_test+".pdf"
                const file = path.join(__dirname, '/../public/reportes/', filename)
                pdf.create(html, options).toFile(file, function (err, data) {
                    if (err) {
                        console.log("Error create PDF");
                        console.dir(err)
                        res.status(400).json({
                            data: "",
                            message: "Error al generar PDF."
                        });
                    } else {
                        res.status(201).json({
                            data: `${host}/public/reportes/${filename}`,
                            message: "PDF link Desempeño General."
                        });
                        
                    }
                })
            }
        })
    }).catch(err => chartExporter.killPool())


  }






}

module.exports = ReportesDesempenoService;
