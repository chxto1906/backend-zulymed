
const MongoLib = require("../lib/mongo");
const { ObjectId } = require("mongodb");
const chartExporter = require("highcharts-export-server");
const { dir } = require("console");

class ReportesPostCovidService {
  constructor() {
    this.mongoDB = new MongoLib();
  }

  /* **************************************************************** */
  /* ************************ POSTCOVID ************************* */

  async generateDataPostCovidGraficos(datos) {
    
    

    const data =  {
        _id: datos._id_test,
        semaforo: datos.semaforo,
        dataGenero: await this.getDataGenero(datos._id_test),
        dataEdad: await this.getDataEdad(datos._id_test),
        dataAreas: await this.getDataAreas(datos._id_test),
        satisfaccion: {
          promedio: await this.getPromedioGeneral(datos._id_test,datos.semaforo,'Satisfacción'),
          subdimensiones: await this.getPromedioSubdimensiones(datos._id_test,datos.semaforo,'Satisfacción')
        },
        bienestar: {
          promedio: await this.getPromedioGeneral(datos._id_test,datos.semaforo,'Bienestar Psicológico'),
          subdimensiones: await this.getPromedioSubdimensiones(datos._id_test,datos.semaforo,'Bienestar Psicológico')
        },
        compromiso: {
          promedio: await this.getPromedioGeneral(datos._id_test,datos.semaforo,'Compromiso'),
          subdimensiones: await this.getPromedioSubdimensiones(datos._id_test,datos.semaforo,'Compromiso')
        },
        individual_bienestar: await this.getDataIndividualArea(datos._id_test,datos.semaforo,'Bienestar Psicológico')
        
    }

    await this.mongoDB.deleteFisicamente('reportes',{_id:datos._id_test})
    let _id_reporte = await this.mongoDB.create('reportes',data)
    const resultado = await this.mongoDB.getNoObject('reportes',datos._id_test)

    return resultado

  }


  async getPromedioSubdimensiones(_id_test,semaforo,dimension) {
    let subdimensiones = ['Dirección','Relaciones entre equipo','Autorrealización',
    'Implicación','Organización del trabajo','Innovación','Condiciones','Información'];
    if (dimension == 'Bienestar Psicológico'){
      subdimensiones = ['Estrés','Depresión','Ansiedad']
    }else if(dimension == 'Compromiso'){
      subdimensiones = ['Afectivo','Normativo']
    }

    let resultados = []
    for (let index = 0; index < subdimensiones.length; index++) {
      const subdimension = subdimensiones[index];
      const resultado = await this.getPromedioGeneral(_id_test,semaforo,dimension,subdimension)
      const areas = await this.getDataPromedioPorAreas(_id_test,semaforo,dimension,subdimension)
      const generos = await this.getDataPromedioPorGenero(_id_test,semaforo,dimension,subdimension)
      const edades = await this.getDataPromedioPorEdad(_id_test,semaforo,dimension,subdimension)
      resultados.push(
        { 
          label: subdimension,
          promedio: [{ y: resultado.porcentaje,color:resultado.color }],
          texto: this.obtenerTextoPorSemaforoDimensionSubdimension(dimension,subdimension,resultado.label),
          areas,
          generos,
          edades
        }
      )
    }

    return resultados
  }


  async getDataGenero(_id_test) {
    let cantidadMasculino = await this.mongoDB.getCantidadSexoByTest('users_tests',_id_test,'M')
    let cantidadFemenino = await this.mongoDB.getCantidadSexoByTest('users_tests',_id_test,'F')
    cantidadMasculino = cantidadMasculino.length == 1 ? cantidadMasculino[0].cantidad : 0
    cantidadFemenino = cantidadFemenino.length == 1 ? cantidadFemenino[0].cantidad : 0
    const total = cantidadMasculino + cantidadFemenino
    const porcentajeMasculino = cantidadMasculino * 100 / total
    const porcentajeFemenino = cantidadFemenino * 100 / total

    return [
        {
            name: 'Masculino',
            y: Math.round(porcentajeMasculino * 100) / 100,
            color: '#4472c3'
        }, {
            name: 'Femenino',
            y: Math.round(porcentajeFemenino * 100) / 100,
            color: '#eb7c30'
        }]

  }

  async getDataEdad(_id_test) {
    let cantidadTotal = await this.mongoDB.getCantidadTotalUsuariosByTest('users_tests',_id_test)
    cantidadTotal = cantidadTotal.length == 1 ? cantidadTotal[0].cantidad : 0

    let cantidad18A25 = await this.mongoDB.getCantidadUsuariosByTestAndEdad('users_tests',_id_test,18,25)
    cantidad18A25 = cantidad18A25.length == 1 ? cantidad18A25[0].cantidad : 0

    let cantidad251A32 = await this.mongoDB.getCantidadUsuariosByTestAndEdad('users_tests',_id_test,25.1,32)
    cantidad251A32 = cantidad251A32.length == 1 ? cantidad251A32[0].cantidad : 0

    let cantidad321A39 = await this.mongoDB.getCantidadUsuariosByTestAndEdad('users_tests',_id_test,32.1,39)
    cantidad321A39 = cantidad321A39.length == 1 ? cantidad321A39[0].cantidad : 0

    let cantidad391A46 = await this.mongoDB.getCantidadUsuariosByTestAndEdad('users_tests',_id_test,39.1,46)
    cantidad391A46 = cantidad391A46.length == 1 ? cantidad391A46[0].cantidad : 0

    let cantidad461A53 = await this.mongoDB.getCantidadUsuariosByTestAndEdad('users_tests',_id_test,46.1,53)
    cantidad461A53 = cantidad461A53.length == 1 ? cantidad461A53[0].cantidad : 0

    let cantidad531A60 = await this.mongoDB.getCantidadUsuariosByTestAndEdad('users_tests',_id_test,53.1,60)
    cantidad531A60 = cantidad531A60.length == 1 ? cantidad531A60[0].cantidad : 0

    let cantidadMasDe60 = await this.mongoDB.getCantidadUsuariosByTestAndEdad('users_tests',_id_test,60)
    cantidadMasDe60 = cantidadMasDe60.length == 1 ? cantidadMasDe60[0].cantidad : 0

    return [
            {
                name: '18 a 25',
                y: Math.round(cantidad18A25 * 100) / 100,
                color: '#4472c4'
            }, {
                name: '25.1 a 32',
                y: Math.round(cantidad251A32 * 100) / 100,
                color: '#4472c4'
            }, {
                name: '32.1 a 39',
                y: Math.round(cantidad321A39 * 100) / 100,
                color: '#4472c4'
            }, {
                name: '39.1 a 46',
                y: Math.round(cantidad391A46 * 100) / 100,
                color: '#4472c4'
            }, {
                name: '46.1 a 53',
                y: Math.round(cantidad461A53 * 100) / 100,
                color: '#4472c4'
            }, {
              name: '53.1 a 60',
              y: Math.round(cantidad531A60 * 100) / 100,
              color: '#4472c4'
            }, {
                name: 'Más de 60',
                y: Math.round(cantidadMasDe60 * 100) / 100,
                color: '#4472c4'
            }
          ]

  }

  async getDataAreas(_id_test){
    let areas = await this.mongoDB.getCantidadUsuariosGroupByAreasByTest('users_tests',_id_test)

    for (var i = 0, l = areas.length; i < l; i++) {
        let area = areas[i]
        areas[i] = {name:area._id[0],y:area.count}
    }

    areas.sort( this.compare )

    return areas
   
  }

  
  async getDataPorCadaDimension(_id_test,semaforo) {
    let test = await this.mongoDB.get('tests',_id_test)
    const _id_empresa = test._id_empresa
    let dimensiones = await this.mongoDB.getAll('subdimensiones',{delete:false})

    for (let index = 0; index < dimensiones.length; index++) {
      const element = dimensiones[index];
      const dataDimension = await this.getPromedioByDimension(_id_test,semaforo,element.abreviatura)
      const dataAreas = await this.getDataPromedioPorAreas(_id_test,semaforo,false,element.abreviatura)
      const dataGenero = await this.getDataPromedioPorGenero(_id_test,semaforo,false,element.abreviatura)
      const dataAntiguedad = await this.getDataPromedioPorAntiguedad(_id_test,semaforo,false,element.abreviatura)
      const title = element.label
      const result = {
        dataDimension,
        dataAreas,
        dataGenero,
        dataAntiguedad,
        title
      }
      dimensiones[index] = result
    }

    return dimensiones
  }

  async getPromedioByDimension (_id_test,semaforo,dimension) {
    const valor = await this.getPromedioGeneral(_id_test,semaforo,[],false,dimension)
    return [{y:valor.porcentaje,color:valor.color}]
  }

  async getDataPromedioPorAreas(_id_test,semaforo,dimension=null,subdimension=null) {
    let test = await this.mongoDB.get('tests',_id_test)
    const _id_empresa = test._id_empresa
    let areas = await this.mongoDB.getAll('departamentos',{_id_empresa})
    for (let index = 0; index < areas.length; index++) {
      const element = areas[index];
      const _id_departamento = String(element._id)
      const resIdsUsers = await this.mongoDB.getAll('users_tests',{_id_test,_id_departamento,_id_empresa},{_id_usuario:1})
      const ids_users = resIdsUsers.map(function(val) {
        return val._id_usuario
      }) || []
      const promedioArea = await this.getPromedioGeneral(_id_test,semaforo,dimension,subdimension,ids_users)
      areas[index] = {name:element.nombre,y:promedioArea.porcentaje,color:promedioArea.color}
    }

    areas.sort( this.compare )

    const response = {data: areas,menor:areas[0],mayor:areas[areas.length-1]}

    return response

  }

  async getDataPromedioPorEdad(_id_test,semaforo,dimension,subdimension) {
    let edades = []
    let ids_18A25 = await this.mongoDB.getIdsUsuariosByTestAndEdad('users_tests',_id_test,18,25)
    let ids_users = ids_18A25.map(function(val) { return String(val.usuario._id) }) || []
    let promedio = await this.getPromedioGeneral(_id_test,semaforo,dimension,subdimension,ids_users)
    edades.push({name:'18 a 25',y:promedio.porcentaje,color:promedio.color})

    let ids_251A32 = await this.mongoDB.getIdsUsuariosByTestAndEdad('users_tests',_id_test,25.1,32)
    ids_users = ids_251A32.map(function(val) { return String(val.usuario._id) }) || []
    promedio = await this.getPromedioGeneral(_id_test,semaforo,dimension,subdimension,ids_users)
    edades.push({name:'25.1 a 32',y:promedio.porcentaje,color:promedio.color})

    let ids_321A39 = await this.mongoDB.getIdsUsuariosByTestAndEdad('users_tests',_id_test,32.1,39)
    ids_users = ids_321A39.map(function(val) { return String(val.usuario._id) }) || []
    promedio = await this.getPromedioGeneral(_id_test,semaforo,dimension,subdimension,ids_users)
    edades.push({name:'32.1 a 39',y:promedio.porcentaje,color:promedio.color})

    let ids_391A46 = await this.mongoDB.getIdsUsuariosByTestAndEdad('users_tests',_id_test,39.1,46)
    ids_users = ids_391A46.map(function(val) { return String(val.usuario._id) }) || []
    promedio = await this.getPromedioGeneral(_id_test,semaforo,dimension,subdimension,ids_users)
    edades.push({name:'39.1 a 46',y:promedio.porcentaje,color:promedio.color})

    let ids_461A53 = await this.mongoDB.getIdsUsuariosByTestAndEdad('users_tests',_id_test,46.1,53)
    ids_users = ids_461A53.map(function(val) { return String(val.usuario._id) }) || []
    promedio = await this.getPromedioGeneral(_id_test,semaforo,dimension,subdimension,ids_users)
    edades.push({name:'46.1 a 53',y:promedio.porcentaje,color:promedio.color})

    let ids_531A60 = await this.mongoDB.getIdsUsuariosByTestAndEdad('users_tests',_id_test,53.1,60)
    ids_users = ids_531A60.map(function(val) { return String(val.usuario._id) }) || []
    promedio = await this.getPromedioGeneral(_id_test,semaforo,dimension,subdimension,ids_users)
    edades.push({name:'53.1 a 60',y:promedio.porcentaje,color:promedio.color})

    let ids_MasDe60 = await this.mongoDB.getIdsUsuariosByTestAndEdad('users_tests',_id_test,60)
    ids_users = ids_MasDe60.map(function(val) { return String(val.usuario._id) }) || []
    promedio = await this.getPromedioGeneral(_id_test,semaforo,dimension,subdimension,ids_users)
    edades.push({name:'Más de 60',y:promedio.porcentaje,color:promedio.color})

    
    return edades
    
  }

  async getDataPromedioPorGenero(_id_test,semaforo,dimension=null,subdimension) {
    let test = await this.mongoDB.get('tests',_id_test)
    let generos = []
    const _id_empresa = test._id_empresa
    const resIdsUsersMasculino = await this.mongoDB.getAll('users',{sexo:'M',delete:false,rol:'user'},{_id:1})
    const ids_users_masculino = resIdsUsersMasculino.map(function(val) {
      return String(val._id)
    }) || []
    let resIdsUsers = await this.mongoDB.getAll('users_tests',
        {_id_test,_id_empresa,_id_usuario:{$in:ids_users_masculino}},{_id_usuario:1})
    let ids_users = resIdsUsers.map(function(val) {
      return val._id_usuario
    }) || []
    const promedioMasculino = await this.getPromedioGeneral(_id_test,semaforo,dimension,subdimension,ids_users)
    generos.push({name:'Masculino',y:promedioMasculino.porcentaje,color:promedioMasculino.color})


    const resIdsUsersFemenino = await this.mongoDB.getAll('users',{sexo:'F',delete:false,rol:'user'},{_id:1})
    const ids_users_femenino = resIdsUsersFemenino.map(function(val) {
      return String(val._id)
    }) || []
    resIdsUsers = await this.mongoDB.getAll('users_tests',
        {_id_test,_id_empresa,_id_usuario:{$in:ids_users_femenino}},{_id_usuario:1})
    ids_users = resIdsUsers.map(function(val) {
      return val._id_usuario
    }) || []

    const promedioFemenino = await this.getPromedioGeneral(_id_test,semaforo,dimension,subdimension,ids_users)
    generos.push({name:'Femenino',y:promedioFemenino.porcentaje,color:promedioFemenino.color})

    generos.sort( this.compare )

    return generos

  }


  async getDataPromedioPorAntiguedad(_id_test,semaforo,cla=true,dimension=null){

    const arrayAntiguedades = [
      {desde: 1, hasta: 6, label: 'De 1 a 6 meses'},
      {desde: 7, hasta: 18, label: 'De 7 a 18 meses'},
      {desde: 19, hasta: 36, label: 'De 19 a 36 meses'},
      {desde: 37, hasta: 60, label: 'De 37 a 60 meses'},
      {desde: 61, hasta: 120, label: 'De 61 a 120 meses'},
      {desde: 121, hasta: null, label: 'De 121 en adelante'}
    ]

    let test = await this.mongoDB.get('tests',_id_test)
    const _id_empresa = test._id_empresa
    
    for (let index = 0; index < arrayAntiguedades.length; index++) {
      const element = arrayAntiguedades[index];
      
      const resIdsUsers = await this.mongoDB.getAll('users_tests',
      {_id_test,_id_empresa,antiguedad:{$gte:element.desde,$lte:element.hasta}},{_id_usuario:1})
      const ids_users = resIdsUsers.map(function(val) {
        return val._id_usuario
      }) || []

      const promedioAntiguedad = await this.getPromedioGeneral(_id_test,semaforo,ids_users,cla,dimension)
      arrayAntiguedades[index] = {name:element.label,y:promedioAntiguedad.porcentaje,color:promedioAntiguedad.color}
    }
    arrayAntiguedades.sort( this.compare )

    return arrayAntiguedades

  }

  compare( a, b ) {
    if ( a.y < b.y ){
      return -1;
    }
    if ( a.y > b.y ){
      return 1;
    }
    return 0;
  }

  compareX( a, b ) {
    if ( a.x < b.x ){
      return -1;
    }
    if ( a.x > b.x ){
      return 1;
    }
    return 0;
  }

  async getPromedioGeneral(_id_test,semaforo,dimension=null,subdimension=null,ids_users=[]) {
    const valorMaximo = 2
    let cantidadRespuestas = await this.mongoDB.cantidadRespuestasPostCovid('respuestas',_id_test,ids_users,dimension,subdimension)
    cantidadRespuestas = cantidadRespuestas.length == 1 ? cantidadRespuestas[0].sumaTotal : 0
    const puntajeExitoso = valorMaximo * cantidadRespuestas
    
    let puntajeRespuestasObtenidasSi = await this.mongoDB.cantidadRespuestasObtenidasPostCovid('respuestas',_id_test,'si',ids_users,dimension,subdimension)
    puntajeRespuestasObtenidasSi = puntajeRespuestasObtenidasSi.length == 1 ? puntajeRespuestasObtenidasSi[0].sumaTotal : 0
    let puntajeRespuestasObtenidasNo = await this.mongoDB.cantidadRespuestasObtenidasPostCovid('respuestas',_id_test,'no',ids_users,dimension,subdimension)
    puntajeRespuestasObtenidasNo = puntajeRespuestasObtenidasNo.length == 1 ? puntajeRespuestasObtenidasNo[0].sumaTotal : 0
    let puntajeRespuestasObtenidasOtro = await this.mongoDB.cantidadRespuestasObtenidasPostCovid('respuestas',_id_test,'otro',ids_users,dimension,subdimension)
    puntajeRespuestasObtenidasOtro = puntajeRespuestasObtenidasOtro.length == 1 ? puntajeRespuestasObtenidasOtro[0].sumaTotal : 0

    const puntajeObtenido = puntajeRespuestasObtenidasSi + puntajeRespuestasObtenidasNo + puntajeRespuestasObtenidasOtro

    let porcentajeGeneral = puntajeObtenido * 100 / puntajeExitoso

    porcentajeGeneral = Math.round(porcentajeGeneral * 100) / 100

    if (dimension == 'Bienestar Psicológico'){
      porcentajeGeneral = 100 - porcentajeGeneral
    }
    
    let resultado = {porcentaje: 0,label:""}
    for (const item in semaforo) {
      if (porcentajeGeneral >= semaforo[item].desde && porcentajeGeneral <= semaforo[item].hasta){
        resultado = {porcentaje: porcentajeGeneral,label:semaforo[item].label,color:semaforo[item].color}
        break
      }
    }

    return resultado
    
  }


  generateBase64Chart = (options) => {
    return new Promise((resolve, reject) => {
      chartExporter.export(options, (err, resp) => {
        if (err) {
            console.log("==options==");
            console.dir(options)
            console.log("==error==");
            console.dir(err)
            console.log("==resp==");
            console.dir(resp)
            return reject(err)
        }
        const image64 = resp.data;
        const filename = resp.filename;
        
        resolve(filename)
        
      })
    })
  }


  getOptionsDimension(data,title,num) {
    return {
        type: "svg",
        outfile: `public/graficos/clima/dataResumenDimension${num}.dataDimension.svg`,
        options: {
            'chart': {
                'type': 'solidgauge'
            },
            credits: {
                enabled: false
            },
            'title': {
                text: title,
                style: {
                    fontSize:"3em",
                    color: "#000000"
                },
                y:50
            },
            'tooltip': {
                'enabled': false
            },
            
            'pane': {
                'center': ['50%', '50%'],
                'size': '300px',
                'startAngle': 0,
                'endAngle': 360,
                'background': {
                    'backgroundColor': '#eaeaea',
                    'innerRadius': '80%',
                    'outerRadius': '100%',
                    'borderWidth': 0
                }
            },

            'yAxis': {
                'min': 0,
                'max': 100,
                'labels': {
                    'enabled': false
                },
            
                'lineWidth': 0,
                'minorTickInterval': null,
                'tickPixelInterval': 400,
                'tickWidth': 0
            },

            'plotOptions': {
                'solidgauge': {
                    'innerRadius': '80%',
                    'dataLabels': {
                    'enabled': true,
                    'format': '{y} %',
                    'borderColor': "#FFFFFF",
                    style: {
                        fontSize: '4em'
                    },
                    y:-35
                    }
                }
            },
            
            'series': [{
                'name': title,
                'data': data
            }]
        }
    }
  }
  getOptionsDimensionAreas(data,title,num) {
    return {
        type: "svg",
        outfile: `public/graficos/clima/dataResumenDimension${num}.dataAreas.svg`,
      options: {
        chart: {
          type: 'bar'
      },
      credits: {
          enabled: false
      },
      title: {
          text: 'Resumen por Áreas de '+title
      },
      xAxis: {
          type: 'category',
          labels: {
              style: {
                  fontSize: '13px',
                  fontFamily: 'Verdana, sans-serif'
              }
          }
      },
      yAxis: {
          min: 0,
          title: {
              text: 'Porcentaje de calificación'
          },

          labels: {
              formatter: function() {
                  return this.value + ' %';
              }
          }
      },
      legend: {
          enabled: false
      },
      tooltip: {
          pointFormat: '<b>{point.y:.2f} %</b>'
      },
      plotOptions: {
          bar: {
              borderRadius: 5,
              dataLabels: {
                  enabled: true,
                  format: '<b>{point.y:.2f} %</b>'
              },
          }
      },
      series: [{
          name: 'Porcentaje de calificación',
          data: data,
          dataLabels: {
              enabled: true,
              color: '#000000',
              align: 'center',
              
          }
      }]
      }
    }
  }

  getOptionsDimensionGenero(data,title,num) {
    return {
        type: "svg",
        outfile: `public/graficos/clima/dataResumenDimension${num}.dataGenero.svg`,
      options: {
          chart: {
            type: 'bar'
        },
        credits: {
            enabled: false
        },
        title: {
            text: 'Resumen por Género de '+title
        },
        xAxis: {
            type: 'category',
            labels: {
                style: {
                    fontSize: '13px',
                    fontFamily: 'Verdana, sans-serif'
                }
            }
        },
        yAxis: {
            min: 0,
            title: {
                text: 'Porcentaje de calificación'
            },

            labels: {
                formatter: function() {
                    return this.value + ' %';
                }
            }
        },
        legend: {
            enabled: false
        },
        tooltip: {
            pointFormat: '<b>{point.y:.2f} %</b>'
        },
        plotOptions: {
            bar: {
                borderRadius: 5,
                dataLabels: {
                    enabled: true,
                    format: '<b>{point.y:.2f} %</b>'
                },
            }
        },
        series: [{
            name: 'Porcentaje de calificación',
            data: data,
            dataLabels: {
                enabled: true,
                color: '#000000',
                align: 'center',
                
            }
        }]
      }
    }
  }


  getOptionsFactoresMotivacionales(data,title,num) {
    return {
        type: "svg",
        outfile: `public/graficos/diagnostico/dataFactoresMotivacionales${num}.svg`,
        options: {
            chart: {
                type: 'bar'
            },
            title: {
                text: title,
                style: {
                    fontSize: '14px' 
                },
            },
            xAxis: {
                categories: ['Autorealización / Reconocimiento', 'Tareas', 'Crecimiento']
            },
            yAxis: {
                min: 0,
                max: 32
            },
            legend: {
                reversed: true
            },
            plotOptions: {
                series: {
                stacking: 'normal'
                }
            },
            series: data
        }
    }
  }

  getOptionsFactoresHigienicos(data,title,num) {
      return {
          type: "svg",
          outfile: `public/graficos/diagnostico/dataFactoresHigienicos${num}.svg`,
          options: {
            chart: {
                type: 'bar'
            },
            title: {
                text: title,
                style: {
                    fontSize: '14px' 
                },
            },
            credits: {
                enabled: false
            },
            xAxis: {
                categories: ['Estatus', 'Relaciones con superiores', 'Relaciones laborales', 'Políticas de empresa', 'Condiciones de trabajo']
            },
            yAxis: {
                min: 0,
                max: 16
            },
            legend: {
                reversed: true
            },
            plotOptions: {
                series: {
                    stacking: 'normal'
                }
            },
            series: data
          }
      }
  }

  getOptionsSubdimensionAreas(data,title,num) {
    return {
        type: "svg",
        outfile: `public/graficos/postcovid/dataSubdimensionArea${title}${num}.svg`,
        options: {
          chart: {
              type: 'bar'
          },
          credits: {
              enabled: false
          },
          title: {
              text: 'Resumen por Áreas de '+title
          },
          xAxis: {
              type: 'category',
              labels: {
                  style: {
                      fontSize: '13px',
                      fontFamily: 'Verdana, sans-serif'
                  }
              }
          },
          yAxis: {
              min: 0,
              title: {
                  text: 'Porcentaje de calificación'
              },

              labels: {
                  formatter: function() {
                      return this.value + ' %';
                  }
              }
          },
          legend: {
              enabled: false
          },
          tooltip: {
              pointFormat: '<b>{point.y:.2f} %</b>'
          },
          plotOptions: {
              bar: {
                  borderRadius: 5,
                  dataLabels: {
                      enabled: true,
                      format: '<b>{point.y:.2f} %</b>'
                  },
              }
          },
          series: [{
              name: 'Porcentaje de calificación',
              data: data,
              dataLabels: {
                  enabled: true,
                  color: '#000000',
                  align: 'center',
                  
              }
          }]
        }
    }
  }

  getOptionsSubdimensionGeneros(data,title,num) {
    return {
        type: "svg",
        outfile: `public/graficos/postcovid/dataSubdimensionGenero${title}${num}.svg`,
        options: {
          chart: {
              type: 'bar'
          },
          credits: {
              enabled: false
          },
          title: {
              text: 'Resumen por Género de '+title
          },
          xAxis: {
              type: 'category',
              labels: {
                  style: {
                      fontSize: '13px',
                      fontFamily: 'Verdana, sans-serif'
                  }
              }
          },
          yAxis: {
              min: 0,
              title: {
                  text: 'Porcentaje de calificación'
              },

              labels: {
                  formatter: function() {
                      return this.value + ' %';
                  }
              }
          },
          legend: {
              enabled: false
          },
          tooltip: {
              pointFormat: '<b>{point.y:.2f} %</b>'
          },
          plotOptions: {
              bar: {
                  borderRadius: 5,
                  dataLabels: {
                      enabled: true,
                      format: '<b>{point.y:.2f} %</b>'
                  },
              }
          },
          series: [{
              name: 'Porcentaje de calificación',
              data: data,
              dataLabels: {
                  enabled: true,
                  color: '#000000',
                  align: 'center',
                  
              }
          }]
        }
    }
  }

  getOptionsSubdimensionPromedio(data,title,num) {
    return {
        type: "svg",
        outfile: `public/graficos/postcovid/dataSubdimensionPromedio${title}${num}.svg`,
        options: {
          'chart': {
              'type': 'solidgauge'
          },
          credits: {
              enabled: false
          },
          'title': {
              text: title,
              style: {
                  fontSize:"3em",
                  color: "#000000"
              },
              y:50
          },
          'tooltip': {
              'enabled': false
          },
          
          'pane': {
              'center': ['50%', '50%'],
              'size': '300px',
              'startAngle': 0,
              'endAngle': 360,
              'background': {
                  'backgroundColor': '#eaeaea',
                  'innerRadius': '80%',
                  'outerRadius': '100%',
                  'borderWidth': 0
              }
          },

          'yAxis': {
              'min': 0,
              'max': 100,
              'labels': {
                  'enabled': false
              },
          
              'lineWidth': 0,
              'minorTickInterval': null,
              'tickPixelInterval': 400,
              'tickWidth': 0
          },

          'plotOptions': {
              'solidgauge': {
                  'innerRadius': '80%',
                  'dataLabels': {
                  'enabled': true,
                  'format': '{y} %',
                  'borderColor': "#FFFFFF",
                  style: {
                      fontSize: '4em'
                  },
                  y:-35
                  }
              }
          },
          
          'series': [{
              'name': title,
              'data': data
          }]
        }
    }
  }

  

  getOptionsBienestarUsuario(data,title,area,num) {
    return {
        type: "svg",
        outfile: `public/graficos/postcovid/dataIndiviual${area}${num}.svg`,
        options: {
          chart: {
              type: 'column'
          },
          credits: {
              enabled: false
          },
          title: {
              text: title
          },
          
          
          xAxis: {
              type: 'category'
          },
          
          yAxis: {
              title: ''
          },
          
          legend: {
              enabled: true
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
          series: data
        }
    }
  }


  getOptionsSubdimensionEdades(data,title,num) {
    return {
        type: "svg",
        outfile: `public/graficos/postcovid/dataSubdimensionEdad${title}${num}.svg`,
        options: {
          chart: {
              type: 'bar'
          },
          credits: {
              enabled: false
          },
          title: {
              text: 'Promedio por edades de '+title
          },
          xAxis: {
              type: 'category',
              labels: {
                  style: {
                      fontSize: '13px',
                      fontFamily: 'Verdana, sans-serif'
                  }
              }
          },
          yAxis: {
              min: 0,
              title: {
                  text: 'Porcentaje de calificación'
              },

              labels: {
                  formatter: function() {
                      return this.value + ' %';
                  }
              }
          },
          legend: {
              enabled: false
          },
          tooltip: {
              pointFormat: '<b>{point.y:.2f} %</b>'
          },
          plotOptions: {
              bar: {
                  borderRadius: 5,
                  dataLabels: {
                      enabled: true,
                      format: '<b>{point.y:.2f} %</b>'
                  },
              }
          },
          series: [{
              name: 'Promedio por edades',
              data: data,
              dataLabels: {
                  enabled: true,
                  color: '#000000',
                  align: 'center',
                  
              }
          }]
        }
    }
  }

  getOptionsIncentivosMasValora(data,title,num) {
    return {
        type: "svg",
        outfile: `public/graficos/diagnostico/dataIncentivosMasValora${num}.svg`,
        options: {
            chart: {
                plotBackgroundColor: null,
                plotBorderWidth: null,
                plotShadow: false,
                type: 'pie'
            },
            credits: {
                enabled: false
            },
            title: {
                text: title
            },
            tooltip: {
                pointFormat: '<b>{point.percentage:.2f}%</b>'
            },
            accessibility: {
                point: {
                    valueSuffix: '%'
                }
            },
            legend: {
                align: 'center',
                verticalAlign: 'top',
                x: 0,
                y: 0
            },
            plotOptions: {
                pie: {
                    allowPointSelect: true,
                    cursor: 'pointer',
                    dataLabels: {
                        distance: -30,
                        color: 'white',
                        enabled: true,
                        format: '<b>{point.percentage:.2f} %'
                    },
                    showInLegend: true
                }
            },
            series: [{
                name: title,
                colorByPoint: true,
                data: data
            }]
        }
    }
  }

  getOptionsLoQueMasMotiva(data,title,num) {
    return {
        type: "svg",
        outfile: `public/graficos/diagnostico/dataLoQueMasMotiva${num}.svg`,
        options: {
            chart: {
                plotBackgroundColor: null,
                plotBorderWidth: null,
                plotShadow: false,
                type: 'pie'
            },
            credits: {
                enabled: false
            },
            title: {
                text: title
            },
            tooltip: {
                pointFormat: '<b>{point.percentage:.2f}%</b>'
            },
            accessibility: {
                point: {
                    valueSuffix: '%'
                }
            },
            legend: {
                align: 'center',
                verticalAlign: 'top',
                x: 0,
                y: 0
            },
            plotOptions: {
                pie: {
                    allowPointSelect: true,
                    cursor: 'pointer',
                    dataLabels: {
                        distance: -30,
                        color: 'white',
                        enabled: true,
                        format: '<b>{point.percentage:.2f} %'
                    },
                    showInLegend: true
                }
            },
            series: [{
                name: title,
                colorByPoint: true,
                data: data
            }]
        }
    }
  }

  getOptionsLoQueMasDesmotiva(data,title,num) {
    return {
        type: "svg",
        outfile: `public/graficos/diagnostico/dataLoQueMasDesmotiva${num}.svg`,
        options: {
            chart: {
                plotBackgroundColor: null,
                plotBorderWidth: null,
                plotShadow: false,
                type: 'pie'
            },
            credits: {
                enabled: false
            },
            title: {
                text: title
            },
            tooltip: {
                pointFormat: '<b>{point.percentage:.2f}%</b>'
            },
            accessibility: {
                point: {
                    valueSuffix: '%'
                }
            },
            legend: {
                align: 'center',
                verticalAlign: 'top',
                x: 0,
                y: 0
            },
            plotOptions: {
                pie: {
                    allowPointSelect: true,
                    cursor: 'pointer',
                    dataLabels: {
                        distance: -30,
                        color: 'white',
                        enabled: true,
                        format: '<b>{point.percentage:.2f} %'
                    },
                    showInLegend: true
                }
            },
            series: [{
                name: title,
                colorByPoint: true,
                data: data
            }]
        }
    }
  }

  getOptionsIncentivosEspera(data,title,num) {
    return {
        type: "svg",
        outfile: `public/graficos/diagnostico/dataIncentivosEspera${num}.svg`,
        options: {
            chart: {
                plotBackgroundColor: null,
                plotBorderWidth: null,
                plotShadow: false,
                type: 'pie'
            },
            credits: {
                enabled: false
            },
            title: {
                text: title
            },
            tooltip: {
                pointFormat: '<b>{point.percentage:.2f}%</b>'
            },
            accessibility: {
                point: {
                    valueSuffix: '%'
                }
            },
            legend: {
                align: 'center',
                verticalAlign: 'top',
                x: 0,
                y: 0
            },
            plotOptions: {
                pie: {
                    allowPointSelect: true,
                    cursor: 'pointer',
                    dataLabels: {
                        distance: -30,
                        color: 'white',
                        enabled: true,
                        format: '<b>{point.percentage:.2f} %'
                    },
                    showInLegend: true
                }
            },
            series: [{
                name: title,
                colorByPoint: true,
                data: data
            }]
        }
    }
  }


  getOptionsDimensionAntiguedad(data,title,num) {
    return {
        type: "svg",
        outfile: `public/graficos/clima/dataResumenDimension${num}.dataAntiguedad.svg`,
      options: {
        chart: {
          type: 'bar'
      },
      credits: {
          enabled: false
      },
      title: {
          text: 'Resumen por Antigüedad de '+title
      },
      xAxis: {
          type: 'category',
          labels: {
              style: {
                  fontSize: '13px',
                  fontFamily: 'Verdana, sans-serif'
              }
          }
      },
      yAxis: {
          min: 0,
          title: {
              text: 'Porcentaje de calificación'
          },

          labels: {
              formatter: function() {
                  return this.value + ' %';
              }
          }
      },
      legend: {
          enabled: false
      },
      tooltip: {
          pointFormat: '<b>{point.y:.2f} %</b>'
      },
      plotOptions: {
          bar: {
              borderRadius: 5,
              dataLabels: {
                  enabled: true,
                  format: '<b>{point.y:.2f} %</b>'
              },
          }
      },
      series: [{
          name: 'Porcentaje de calificación',
          data: data,
          dataLabels: {
              enabled: true,
              color: '#000000',
              align: 'center',
              
          }
      }]
      }
    }
  }



  processGenerateBase64ChartAll(item,num) {
    const that = this
    /*return Promise.all(
      items.map(async (item) => {*/

        return Promise.all([
            that.generateBase64Chart(that.getOptionsDimension(item.dataDimension,item.title,num)),
            that.generateBase64Chart(that.getOptionsDimensionAreas(item.dataAreas.data,item.title,num)),
            that.generateBase64Chart(that.getOptionsDimensionGenero(item.dataGenero,item.title,num)),
            that.generateBase64Chart(that.getOptionsDimensionAntiguedad(item.dataAntiguedad,item.title,num))
        ]).then(values => {
          //return values
            return {
              dataDimension:values[0],
              dataAreas:values[1],
              dataGenero:values[2],
              dataAntiguedad:values[3]
            }

        }).catch(err => console.log("ERROR en processGenerateBase64ChartAll: "+err.message))
        
    /*  })
    );*/
  }

  processGenerateBase64ChartPromiseAllBienestarIndividualArea(items) {
    const that = this
    
    return Promise.all(
      items.map(async (item) => {
        let num = 0;
        return Promise.all(
            item.usuarios.map(async (usuario) => {
                num++
                return Promise.all([
                    that.generateBase64Chart(that.getOptionsBienestarUsuario(usuario.data,usuario.title,item.area,num))
                ]).then(datos => {
                    return {
                        usuario:datos[0],
                        subdimensiones: usuario.data
                    }

                }).catch(err => {
                    console.log("ERROR en processGenerateBase64ChartPromiseAllBienestarIndividualArea: ")
                })
            })
        ).then(values => {
            return {area: item.area,data:values}
        })
      })
    )
  }

  processGenerateBase64ChartPromiseAllSubdimensiones(items) {
    const that = this
    let num = 0;
    return Promise.all(
        items.map(async (subdimension) => {
            num++
            return Promise.all([
                that.generateBase64Chart(that.getOptionsSubdimensionPromedio(subdimension.promedio,subdimension.label,num)),
                that.generateBase64Chart(that.getOptionsSubdimensionAreas(subdimension.areas.data,subdimension.label,num)),
                that.generateBase64Chart(that.getOptionsSubdimensionGeneros(subdimension.generos,subdimension.label,num)),
                that.generateBase64Chart(that.getOptionsSubdimensionEdades(subdimension.edades,subdimension.label,num)),
            ]).then(datos => {
                return {
                    promedio:datos[0],
                    areas:datos[1],
                    generos:datos[2],
                    edades:datos[3],
                    texto:subdimension.texto
                }

            }).catch(err => {
                console.log("ERROR en processGenerateBase64ChartPromiseAllSubdimensiones: ")
            })
        })
    )
  }


  processGenerateBase64ChartPromiseAllIncentivos(items) {
    const that = this
    let num = 0;
    return Promise.all(
      items.map(async (item) => {
          num++
        return Promise.all([
            that.generateBase64Chart(that.getOptionsIncentivosMasValora(item.data.incentivosMasValora,
                "INCENTIVOS QUE MÁS VALORAN",item.area+"_usuario_"+num)),
            that.generateBase64Chart(that.getOptionsLoQueMasMotiva(item.data.loQueMasMotiva,
                    "LO QUE MÁS LES MOTIVA A LOS COLABORADORES",item.area+"_usuario_"+num)),
            that.generateBase64Chart(that.getOptionsLoQueMasDesmotiva(item.data.loQueMasDesmotiva,
                        "LO QUE MÁS LES DESMOTIVA A LOS COLABORADORES",item.area+"_usuario_"+num)),
            that.generateBase64Chart(that.getOptionsIncentivosEspera(item.data.incentivosEspera,
                            "INCENTIVOS QUE ESPERAN POR PARTE DE LA EMPRESA",item.area+"_usuario_"+num)),
        ]).then(datos => {
            return {
                area: item.area,
                dataIncentivosMasValora:datos[0],
                dataLoQueMasMotiva:datos[1],
                dataLoQueMasDesmotiva:datos[2],
                dataIncentivosEspera:datos[3]
            }

        }).catch(err => console.log("ERROR en processGenerateBase64ChartPromiseAllIncentivos: "+err.message))
        
      })
    )
  }

  
  async generatePdfDiagnostico (datos,res,host) {
    const ejs = require("ejs");
    const pdf = require("html-pdf");
    const path = require("path");
    let data = await this.mongoDB.getNoObject('reportes',datos._id_test)
    data = Object.assign(data,datos)
    let test = await this.mongoDB.get('tests',data._id_test)
    const _id_empresa = test._id_empresa
    const empresa = await this.mongoDB.get('empresas',_id_empresa)
    data.filepath = empresa.filepath  
    const datosPorGruposGenero = {
        type: "svg",
        outfile: 'public/graficos/diagnostico/datosPorGruposGenero.svg',
        options: {
            chart: {
                /*height: '300px',*/
                plotBackgroundColor: null,
                plotBorderWidth: null,
                plotShadow: false,
                type: 'pie'
            },
            credits: {
                enabled: false
            },
            title: {
                text: 'GÉNERO'
            },
            tooltip: {
                pointFormat: '<b>{point.percentage:.2f}%</b>'
            },
            accessibility: {
                point: {
                    valueSuffix: '%'
                }
            },
            legend: {
                align: 'center',
                verticalAlign: 'top',
                x: 0,
                y: 0
            },
            plotOptions: {
                pie: {
                    allowPointSelect: true,
                    cursor: 'pointer',
                    dataLabels: {
                        distance: -30,
                        color: 'white',
                        enabled: true,
                        format: '<b>{point.percentage:.2f} %'
                    },
                    showInLegend: true
                }
            },
            series: [{
                name: 'Género',
                colorByPoint: true,
                data: data.dataGenero
            }]
        }
    }

    const datosPorGruposAntiguedad = {
        type: "svg",
        outfile: "public/graficos/diagnostico/datosPorGruposAntiguedad.svg",
      options: {
        chart: {
            /*height: "400px",*/
            plotBackgroundColor: null,
            plotBorderWidth: null,
            plotShadow: false,
            type: 'pie'
        },
        credits: {
            enabled: false
        },
        title: {
            text: 'ANTIGÜEDAD'
        },
        tooltip: {
            pointFormat: '<b>{point.percentage:.2f}%</b>'
        },
        accessibility: {
            point: {
                valueSuffix: '%'
            }
        },
        legend: {
            align: 'center',
            verticalAlign: 'top',
            x: 0,
            y: 0,
            width: 340,
            itemWidth: 170
        },
        plotOptions: {
            pie: {
                allowPointSelect: true,
                cursor: 'pointer',
                dataLabels: {
                    distance: -30,
                    color: 'white',
                    enabled: true,
                    format: '<b>{point.percentage:.2f} %</b>'
                },
                showInLegend: true
            }
        },
        series: [{
            name: 'Antigüedad',
            colorByPoint: true,
            data: data.dataAntiguedad
        }]
      }
    }
    
    const datosPorGruposAreas = {
        type: "svg",
        outfile: "public/graficos/diagnostico/datosPorGruposAreas.svg",
      options: {
        chart: {
            type: 'bar'
        },
        credits: {
            enabled: false
        },
        title: {
            text: 'ÁREAS'
        },
        xAxis: {
            type: 'category',
            labels: {
                style: {
                    fontSize: '13px',
                    fontFamily: 'Verdana, sans-serif'
                }
            }
        },
        yAxis: {
            min: 0,
            title: {
                text: 'Número de Colaboradores'
            }
        },
        legend: {
            enabled: false
        },
        tooltip: {
            pointFormat: '<b>{point.y:.0f} personas</b>'
        },
        plotOptions: {
            column: {
                borderRadius: 5
            }
        },
        series: [{
            name: 'Número de Colaboradores',
            data: data.dataAreas,
            dataLabels: {
                enabled: true,
                color: '#000000',
                align: 'center',
                
            }
        }]
      }
    }

    const datosTotalGeneralAreas = {
        type: "svg",
        outfile: "public/graficos/diagnostico/datosTotalGeneralAreas.svg",
        
      options: {
        chart: {
            type: 'column',
            /*height: '400px',*/
        },
        credits: {
            enabled: false
        },
        title: {
            text: 'Resumen General por Áreas'
        },
        xAxis: {
            type: 'category',
            labels: {
                rotation: -80,
                style: {
                    fontSize: '11px',
                    fontFamily: 'Verdana, sans-serif'
                },
            }
        },
        yAxis: {
            min: 0,
            title: {
                text: 'Porcentaje de calificación'
            },

            labels: {
                formatter: function() {
                    return this.value + ' %';
                },
                style: {
                    fontSize: '8px'
                }
            }
        },
        legend: {
            enabled: false
        },
        tooltip: {
            pointFormat: '<b>{point.y:.2f} %</b>'
        },
        plotOptions: {
            column: {
                borderRadius: 5,
                dataLabels: {
                    enabled: true,
                    rotation: -90,
                    color: '#FFFFFF',
                    align: 'right',
                    format: '<b>{point.y:.2f} %</b>',
                    y: 10,
                    style: {
                        fontSize: '10px',
                        fontFamily: 'Verdana, sans-serif'
                    }
                }
            }
        },
        series: [{
            name: 'Porcentaje de calificación',
            data: data.dataPromedioPorAreas.data,
            dataLabels: {
                enabled: true,
                color: '#000000',
                align: 'center',
                
            }
        }]
      }
    }

    const datosTotalGeneralGeneros = {
        type: "svg",
        outfile: "public/graficos/diagnostico/datosTotalGeneralGeneros.svg",
        options: {
          chart: {
              type: 'column'
          },
          credits: {
              enabled: false
          },
          title: {
              text: 'Resumen General por Género'
          },
          xAxis: {
              type: 'category',
              labels: {
                  rotation: -45,
                  style: {
                      fontSize: '13px',
                      fontFamily: 'Verdana, sans-serif'
                  }
              }
          },
          yAxis: {
              min: 0,
              title: {
                  text: 'Porcentaje de calificación'
              },
  
              labels: {
                  formatter: function() {
                      return this.value + ' %';
                  }
              }
          },
          legend: {
              enabled: false
          },
          tooltip: {
              pointFormat: '<b>{point.y:.2f} %</b>'
          },
          plotOptions: {
              column: {
                  borderRadius: 5,
                  dataLabels: {
                      enabled: true,
                      format: '<b>{point.y:.2f} %</b>'
                  },
              }
          },
          series: [{
              name: 'Porcentaje de calificación',
              data: data.dataPromedioPorGenero,
              dataLabels: {
                  enabled: true,
                  color: '#000000',
                  align: 'center',
                  
              }
          }]
        }
    }
  
    const datosTotalGeneralAntiguedades = {
        type: "svg",
        outfile: "public/graficos/diagnostico/datosTotalGeneralAntiguedades.svg",
        options: {
            chart: {
                type: 'column'
            },
            credits: {
                enabled: false
            },
            title: {
                text: 'Resumen General por Antigüedad'
            },
            xAxis: {
                type: 'category',
                labels: {
                    rotation: -45,
                    style: {
                        fontSize: '13px',
                        fontFamily: 'Verdana, sans-serif'
                    }
                }
            },
            yAxis: {
                min: 0,
                title: {
                    text: 'Porcentaje de calificación'
                },

                labels: {
                    formatter: function() {
                        return this.value + ' %';
                    }
                }
            },
            legend: {
                enabled: false
            },
            tooltip: {
                pointFormat: '<b>{point.y:.2f} %</b>'
            },
            plotOptions: {
                column: {
                    borderRadius: 5,
                    dataLabels: {
                        enabled: true,
                        format: '<b>{point.y:.2f} %</b>'
                    },
                }
            },
            series: [{
                name: 'Porcentaje de calificación',
                data: data.dataPromedioPorAntiguedad,
                dataLabels: {
                    enabled: true,
                    color: '#000000',
                    align: 'center',
                    
                }
            }]
        }
    }


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
        this.generateBase64Chart(datosPorGruposGenero),
        this.generateBase64Chart(datosPorGruposAntiguedad),
        this.generateBase64Chart(datosPorGruposAreas),
        this.generateBase64Chart(datosTotalGeneralAreas),
        this.generateBase64Chart(datosTotalGeneralGeneros),
        this.generateBase64Chart(datosTotalGeneralAntiguedades),
        this.processGenerateBase64ChartPromiseAllIndividual(data.dataIndividual),
        this.processGenerateBase64ChartPromiseAllIncentivos(data.dataIncentivos),
    ]).then(values => {
        chartExporter.killPool();
        data = Object.assign(data,{
          datosPorGruposGenero:values[0],
          datosPorGruposAntiguedad:values[1],
          datosPorGruposAreas:values[2],
          datosTotalGeneralAreas:values[3],
          datosTotalGeneralGeneros:values[4],
          datosTotalGeneralAntiguedades:values[5],
          datosIndividual:values[6],
          datosIncentivos:values[7],
          host:host
        })
        ejs.renderFile(path.join(__dirname, '/../views/', "reporte_diagnostico.ejs"), data, (err, html) => {
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
                const filename = "reporte_diagnostico_"+data._id_test+".pdf"
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
                            message: "PDF link Diagnóstico Motivacional."
                        });
                        
                    }
                })
            }
        })
    }).catch(err => chartExporter.killPool())


  }


  async generateDatosOrigenClima(data,host,res) {
    const ejs = require("ejs");
    const pdf = require("html-pdf");
    const path = require("path");
    
    let test = await this.mongoDB.get('tests',data._id_test)
    const _id_empresa = test._id_empresa
    const empresa = await this.mongoDB.get('empresas',_id_empresa)
    data.filepath = empresa.filepath

    //const respuestas = await this.mongoDB.getAll('respuestas',{_id_test:data._id_test});
    const preguntas = await this.mongoDB.getAll('preguntas',{_id_test:data._id_test})

    var excel = require('excel4node');
    var workbook = new excel.Workbook();
    var worksheet = workbook.addWorksheet('Sheet 1');
    worksheet.cell(1,1).string('RESULTADOS EVALUACIÓN CLIMA LABORAL SERVICABLE')
    worksheet.cell(3,1).string('Nombres')
    worksheet.cell(4,1).string('Apellidos')
    worksheet.cell(5,1).string('Sexo')
    worksheet.cell(6,1).string('Fecha de nacimiento')
    worksheet.cell(7,1).string('Email')
    worksheet.cell(8,1).string('Departamento')
    worksheet.cell(9,1).string('Cargo')
    worksheet.cell(10,1).string('Antigüedad')
    worksheet.cell(11,1).string('Pregunta')
    worksheet.cell(11,2).string('Dimensión')
    worksheet.cell(11,3).string('CLA')
    worksheet.cell(11,4).string('SI')
    worksheet.cell(11,5).string('NO')
    worksheet.cell(11,6).string('?')
    worksheet.cell(11,7).string('Respuesta')

    

    let desdePreguntasY = 12

    for (let index = 0; index < preguntas.length; index++) {
        const pregunta = preguntas[index]
        worksheet.cell(desdePreguntasY,1).string(pregunta.descripcion)
        worksheet.cell(desdePreguntasY,2).string(pregunta.subdimension)
        worksheet.cell(desdePreguntasY,3).string(pregunta.cla ? 'CLA' : '')
        worksheet.cell(desdePreguntasY,4).number(pregunta.si)
        worksheet.cell(desdePreguntasY,5).number(pregunta.no)
        worksheet.cell(desdePreguntasY,6).number(pregunta.otro)
        let desdeUsuariosX = 7
        const usersTests = await this.mongoDB.getAll('users_tests',{_id_test:data._id_test})
        for (let index1 = 0; index1 < usersTests.length; index1++) {
            const userTest = usersTests[index1]
            const respuesta = await this.mongoDB.findOne('respuestas',{_id_pregunta:String(pregunta._id),
                _id_user:userTest._id_usuario,_id_test:data._id_test})
            if (index == 0 ){
                const usuario = await this.mongoDB.get('users',userTest._id_usuario)
                const departamento = await this.mongoDB.get('departamentos',userTest._id_departamento,{nombre:1})
                const cargo = await this.mongoDB.get('cargos',userTest._id_cargo,{nombre:1})
                worksheet.cell(3,desdeUsuariosX).string(usuario.nombre+"")
                worksheet.cell(4,desdeUsuariosX).string(usuario.apellido+"")
                worksheet.cell(5,desdeUsuariosX).string(usuario.sexo+"")
                worksheet.cell(6,desdeUsuariosX).string(usuario.fecha_nacimiento+"")
                worksheet.cell(7,desdeUsuariosX).string(usuario.email+"")
                worksheet.cell(8,desdeUsuariosX).string(departamento ? departamento.nombre+"" : "")
                worksheet.cell(9,desdeUsuariosX).string(cargo ? cargo.nombre+"" : "")
                worksheet.cell(10,desdeUsuariosX).string(userTest ? userTest.antiguedad + ' meses' : "")
                worksheet.cell(11,desdeUsuariosX).string('Respuesta')
            }
            if (respuesta)
                worksheet.cell(desdePreguntasY,desdeUsuariosX).string(respuesta.value == 'otro' ? '?' : respuesta.value)
    
            desdeUsuariosX++
        }
        desdePreguntasY++
    }

    const filename = "reporte_origen_datos_clima_"+data._id_test+".xlsx"
    const file = path.join(__dirname, '/../public/reportes/', filename)

    workbook.write(file);
    res.status(201).json({
        data: `${host}/public/reportes/${filename}`,
        message: "Excel link Datos Clima."
    });

  }

  obtenerTextoPorSemaforoDimensionSubdimension(dimension,subdimension,rango_semaforo) {
    const valores = 
      { "Satisfacción" :
        {
          "Dirección": {
            "Muy satisfactorio":"Las respuestas reflejan un resultado muy satisfactorio; es decir, las personas han sentido un gran respaldo por parte de sus jefes para resolver los inconvenientes presentados en esta época. Han sido su guía para el aporte de nuevas ideas y para alcanzar los objetivos del área. Se recomienda estimular el desempeño de los jefes a que se mantengan estos comportamientos hacia su equipo.",
            "Satisfactorio":"Las respuestas reflejan un resultado satisfactorio; es decir, las personas han sentido el apoyo de sus jefes durante esta época. Han solventado sus dudas  para cumplir con sus tareas y alcanzar los objetivos del área. Se recomienda a los jefes, promover el desarrollo de nuevas ideas y respaldar sus decisiones.",
            "Promedio":"Las respuestas reflejan un resultado promedio; es decir, los jefes en algunas ocasiones han sido un apoyo para las personas de su equipo para cumplir con las tareas encargadas durante este tiempo. Se les recomienda, a los jefes, mejorar la comunicación con el equipo, mostrarse más empático frente a los inconvenientes que tienen las personas y buscar formas, en conjunto, de alcanzar las metas.",
            "Debajo del promedio":"Las respuestas reflejan un resultado por debajo del promedio; es decir, las personas han sentido que les ha faltado el apoyo de sus superiores, en varias ocasiones, para alcanzar las metas propuestas. Se recomienda capacitar a los líderes de las áreas más afectadas en temas de liderazgo y comunicación con su equipo.",
            "Poco satisfactorio":"Las respuestas reflejan un resultado poco satisfactorio; es decir, las personas no han sentido el apoyo de sus jefes o este ha sido en ocasiones puntuales; Se recomienda analizar las competencias de liderazgo de quienes ocupan posiciones de dirección, para establecer un programa de mejora en aquellas habilidades que se requieran en los jefes de manera que, apoyen a su equipo en esta transición hacia una nueva normalidad."
          },
          "Relaciones entre equipo": {
            "Muy satisfactorio":"El resultado muy satisfactorio en esta escala indica que la cohesión y confianza entre los miembros del equipo se ha mantenido a pesar de las circunstancias actuales; se recomienda buscar o mantener espacios para que las personas interactúen y aprovechar esta cercanía para formar equipos que trabajen de manera conjunta en pos de un objetivo del área.",
            "Satisfactorio":"El resultado satisfactorio en esta subdimensión, se refiere a que las personas continúan manteniendo buenas relaciones con sus compañeros de trabajo, a pesar de las circunstancias actuales. En muchas ocasiones, los equipos se han apoyado para enfrentar los cambios que se atraviesan dentro y fuera de la Organización. Se recomienda, monitorear las relaciones interpersonales, de manera que se establezcan programas para mantener la cohesión del grupo.",
            "Promedio":"El resultado promedio indica que el equipo de trabajo no ha sido una fuente de satisfacción ni insatisfacción en este tiempo. Es decir, se mantienen relaciones cordiales pero no siempre existe el apoyo entre los miembros de un equipo para salir adelante en estos tiempos de crisis. Se recomienda, realizar talleres de trabajo en equipo, cooperación, comunicación y coordinación para mejorar en este aspecto.",
            "Debajo del promedio":"El resultado por debajo del promedio indica que las relaciones interpersonales están debilitadas, por lo mismo, las personas no siempre cuentan con los otros miembros de su equipo para apoyarse en tareas o en situaciones complejas. Se recomienda realizar un estudio más profundo para comprender la dinámica de los grupos de trabajo y modificar aquellos comportamientos que provocan esta situación.",
            "Poco satisfactorio":"El resultado poco satisfactorio refleja que las relaciones interpersonales no son las más convenientes en un ambiente de trabajo. Se requiere más trabajo en equipo, cohesión, coordinación y confianza. Se recomienda conversar con los jefes para analizar esta situación y mejorar la cultura de trabajo en equipo de la Organización."
          },
          "Autorrealización": {
            "Muy satisfactorio":"El resultado muy satisfactorio indica que las personas han mantenido su desarrollo personal y profesional a pesar de las circunstancias actuales. Es decir, la Organización les ha apoyado para continuar o impulsar su crecimiento y ha procurado mantener motivado a su personal. Se recomienda, continuar con los programas de motivación intrínseca y extrínseca que han dado resultado y adaptarlos, en caso de ser necesario, a las nuevas necesidades.",
            "Satisfactorio":"El resultado satisfactorio indica que las personas sienten que han podido crecer en el ámbito personal y/o profesional gracias al apoyo que han recibido, la mayor parte de veces, de su Organización. A pesar de las circunstancias actuales, la Empresa continúa preocupándose por las necesidades de su personal. Se recomienda realizar estudios periódicos de las necesidades de los colaboradores y buscar alternativas de motivación intrínseca en la nueva normalidad.",
            "Promedio":"El resultado promedio indica que las personas no han sentido que la Organización contribuye a su Autorrealización como profesionales o seres humanos, pero tampoco ha limitado su crecimiento. Por esta razón, se recomienda diagnosticar lo que el personal requiere en esta escala y proponer acciones de mejora para el desarrollo integral de los trabajadores.",
            "Debajo del promedio":"El resultado por debajo del promedio indica que, en este tiempo, las personas no se han sentido estimuladas por parte de la Organización para el cumplimiento de sus objetivos de crecimiento profesional o personal. Se recomienda realizar Diagnósticos Motivacionales y mejorar los planes de recompensas que tiene la Organización para procurar una mayor satisfacción por parte de los colaboradores.",
            "Poco satisfactorio":"El resultado poco satisfactorio indica que las personas no se sienten que la Organización contribuye a su Autorrealización; por lo mismo, es importante identificar si esta situación ha sido así siempre o a raíz de la pandemia; además, una vez que se tengan estos resultados, se debe analizar el subsistema de Mantenimiento del TTHH para identificar los inconvenientes en el sistema de recompensas extrínseca e intrínsecas que se maneja."
          },
          "Implicación": {
            "Muy satisfactorio":"El resultado muy satisfactorio indica que las personas se han sentido partícipes de las cuestiones relacionadas a su Organización y muy involucradas en los cambios realizados y en el logro de los objetivos durante este tiempo; se recomienda trabajar en programas de Compromiso Organizacional para potencializar este aspecto.",
            "Satisfactorio":"El resultado satisfactorio indica que las personas se han considerado una parte importante de su Organización la mayor parte de veces en este tiempo. Además, han sentido que han contribuido en los cambios que ha implementado la Empresa para adaptarse a la nueva normalidad; se recomienda mantener la comunicación y las estrategias de TTHH para continuar comprometiéndoles a los colaboradores con los cambios y los nuevas necesidades. ",
            "Promedio":"El resultado promedio indica que las personas no se han sentido muy partícipes de las cuestiones que ocurren en su Organización. Saben que su trabajo es importante pero no necesariamente, contribuye al objetivo macro de la Empresa. Se recomienda realizar talleres donde se fomente la Filosofía Corporativa y las personas puedan comprender la importancia de funcionar todos como un sistema para el logro de Objetivos.",
            "Debajo del promedio":"El resultado por debajo del promedio indica que, las personas no se han sentido involucradas en las cuestiones de la Organización o en los cambios que se suscitado en este tiempo; se recomienda se recomienda formar círculos de calidad para analizar las cuestiones de su área y de la Organización y puedan aportar su punto de vista y el de sus compañeros.",
            "Poco satisfactorio":"El resultado poco satisfactorio indica que, las personas trabajan por cumplir con sus responsabilidades más no se sienten partícipes de un objetivo común; se recomienda: trabajar con los líderes de las áreas más afectadas para que transmitan, de manera adecuada y a tiempo, las cuestiones que suceden en la Empresa; que realice reuniones periódicas con las personas a su cargo para escuchar sus puntos de vista y que se realicen compromisos de cooperación entre todos para el logro de objetivos."
          },
          "Organización del trabajo": {
            "Muy satisfactorio":"Un resultado muy satisfactorio en esta escala demuestra que las personas han podido organizar muy bien sus actividades para cumplirlas dentro de la jornada establecida; han recibido directrices claras para desempeñar sus funciones y no afectar otras actividades de índole personal, familiar o social; por esto, se recomienda mantener la distribución de tareas y tiempos de la manera que se ha manejado.",
            "Satisfactorio":"Un resultado satisfactorio en esta escala, demuestra que la distribución de las tareas y los tiempos que se han definido para su cumplimiento son reales y se pueden alcanzar. Las personas mantienen una organización que les permite cumplir sus responsabilidades sin afectar de manera considerable otras actividades. Se recomienda hacer un estudio periódico de este tema, para garantizar que todas las personas cumplan su tareas en la jornada establecida.",
            "Promedio":"Un resultado promedio indica que las personas han podido organizar algunas de sus tareas para realizarlas dentro de la jornada, pero otras requieren más de su tiempo por lo que interfieren con sus actividades personales, sociales y/o familiares. Se recomienda revisar los manuales de funciones, realizar un estudio de carga laboral y analizar los resultados de las evaluaciones de desempeño de otros períodos para tener un panorama más claro de lo que ocurre y el por qué.",
            "Debajo del promedio":"Un resultado por debajo del promedio indica que las personas no han podido organizar la mayor parte de sus funciones para cumplirlas en el horario laboral o requiere de muchos recursos para completarlas; se recomienda realizar un seguimiento con el jefe del área para analizar la distribución de las funciones y establecer indicadores de gestión que permitan medir el cumplimiento dentro de los tiempos asignados.",
            "Poco satisfactorio":"Un resultado poco satisfactorio demuestra que las personas no pueden organizar sus tareas y por lo mismo requieren más tiempo del establecido para realizar sus funciones. Se recomienda analizar las características del cargo conjuntamente con el jefe del área, ejecutar un estudio de las funciones y responsabilidades del área y los recursos que se tienen para ejecutarlas, analizar el nivel de adecuación de las personas al cargo y realizar capacitaciones en técnicas de planificación, manejo y distribución del tiempo."
          },
          "Innovación": {
            "Muy satisfactorio":"El resultado muy satisfactorio indica que la Organización ha implementado metodologías y procesos innovadores para adaptarse a la nueva normalidad y que las personas se encuentran capacitadas desempeñarse en estos tiempos. Por esto, se recomienda a la empresa mantenerse alerta de los cambios que se produzcan y que sean los pioneros en implementar, a tiempo, lo que se requiera, sobre todo, con su Talento Humano.",
            "Satisfactorio":"El resultado satisfactorio refleja que la Organización y su gente se han adaptado bastante bien a los cambios del entorno. Han podido mejorar muchos procesos para continuar siendo competitivos. Se recomienda mantener capacitado al personal, para que puedan desempeñar sus funciones haciendo uso de la tecnología actual para optimizar recursos.",
            "Promedio":"El resultado promedio indica que la Organización se ha adaptado a ciertos cambios que ha provocado la situación actual; sin embargo, se pueden buscar alternativas para ser más eficiente y eficaz en los procesos que se realizan en las diferentes áreas.",
            "Debajo del promedio":"El resultado por debajo del promedio indica que la Organización y su gente no han podido adaptarse a muchos de los cambios y necesidades que demanda la situación actual. Por esto, se recomienda realizar un Benchmarking con empresas similares para entender cómo han adaptado sus procesos y metodologías a la nueva normalidad y transmitir esto a la gente.",
            "Poco satisfactorio":"El resultado poco satisfactorio indica que la Organización se ha mantenido con los procesos y metodologías tradicionales y por ende su personal no se ha adaptado a la situación actual. Se recomienda iniciar un procesos de transformación paulatina y gestionar adecuadamente el cambio para que las personas no se resistan al mismo y la Organización sea más productiva frente al nuevo escenario."
          },
          "Condiciones": {
            "Muy satisfactorio":"El resultado muy satisfactorio indica que las condiciones establecidas en la Organización son reconocidas como adecuadas y equitativas para todos los colaboradores. Las mismas han permitido desarrollar las funciones con la mayor normalidad posible y promoviendo una cultura de bioseguridad; por esto, la Organización debe continuar comunicando, de la manera correcta, las políticas y condiciones que se establezcan para enfrentar la crisis",
            "Satisfactorio":"El resultado satisfactorio indica que las condiciones laborales y de bioseguridad son aceptadas de manera positiva por la gente. Por lo mismo, se debe mantener actualizada la información de la opinión de los colaboradores para evitar que las decisiones que se tomen, sobre esta subdimensión, puedan desmotivar al personal.",
            "Promedio":"El resultado promedio indica que las condiciones laborales que ha implementado la Organización en este tiempo, no han sido completamente aceptadas ni rechazadas por el personal. Se recomienda analizar los aspectos que deberían mantenerse y cambiarse para mejorar las condiciones ofrecidas a los colaboradores.",
            "Debajo del promedio":"El resultado por debajo del promedio indica que muchas personas no están de acuerdo con las políticas ni condiciones que se han implementado para enfrentar esta crisis. Se recomienda realizar mesas redondas donde se propongan alternativas que sean analizadas y puedan mejorar la percepción de las personas con respecto a este tema.",
            "Poco satisfactorio":"El resultado poco satisfactorio indica que las condiciones adoptadas para enfrentar la crisis producida por el Covid-19 no han sido aceptadas por la mayor parte de colaboradores. Para esto, se recomienda revisar las políticas establecidas, formar grupos de discusión del tema, mejorar las estrategias de comunicación de las condiciones establecidas y brindar un seguimiento a las mismas."
          },
          "Información": {
            "Muy satisfactorio":"Un resultado muy satisfactorio indica que, a pesar de las limitaciones, Las personas de la Organización mantienen una comunicación a tiempo, asertiva y clara lo que les ha permitido mantenerse al día con la información de cuestiones internas y externas de la Empresa. Se recomienda continuar utilizando los canales que se han manejado hasta la actualidad.",
            "Satisfactorio":"Un resultado satisfactorio indica que la comunicación que se maneja en la Organización y el nivel de información que se tiene sobre cuestiones de la Empresa, en la actualidad, es bastante bueno. Se recomienda utilizar todo el tiempo los canales más adecuados para comunicarse con las diferentes personas de manera constante. ",
            "Promedio":"Un resultado promedio indica que las personas reciben información sobre la organización pero no es constante o la comunicación se ha visto limitada por la situación actual; se recomienda investigar sobre medios de comunicación adaptados a la nueva normalidad que permitan mantener una cierta cercanía a pesar de no siempre poder reunirse de manera presencial.",
            "Debajo del promedio":"Un resultado por debajo del promedio indica que las personas no reciben mucha información sobre la situación de su Organización o esta proviene de terceros. Se recomienda mejorar la frecuencia con la que se comunican las cuestiones de la Empresa y que la información se transmita por parte de los Jefes inmediatos u otras personas que conozcan claramente lo que ocurre.",
            "Poco satisfactorio":"Un resultado poco satisfactorio indica que las personas han recibido información muy limitada de la Organización, fuera de tiempo, no es clara y/o no proviene de fuentes confiables. Se recomienda realizar mesas de diálogo en grupos reducidos, donde se comuniquen las cuestiones de la Empresa y se despejen las dudas a tiempo. Además, sería necesario analizar si esta situación se ha dado a raíz de la pandemia o los inconvenientes de la comunicación siempre han estado presentes."
          }
        },
        "Compromiso": {
          "Afectivo": {
            "Muy satisfactorio":"El resultado muy satisfactorio indica que las personas tienen un gran vínculo emocional con la Organización; se identifican con los objetivos, valores e intereses institucionales. Sienten como propias las cuestiones que ocurren dentro de la Empresa. En esta situación, este resultado puede deberse las prácticas y políticas, centradas en las personas, que se han tomado para enfrentar la crisis.",
            "Satisfactorio":"El resultado satisfactorio indica que las personas comparten algunos intereses y objetivos con la organización. Han desarrollado un cariño por su Empresa y valoran muchas de las actitudes y decisiones que han tenido sus superiores durante este tiempo.",
            "Promedio":"Un resultado promedio indica que las personas tienen un compromiso con la Organización, pero no necesariamente sienten cariño por ella y por quienes la conforman. En este caso, se recomienda realizar estudios de Compromiso Organizacional para obtener un resultado más claro de esta subdimensión.",
            "Debajo del promedio":"El resultado por debajo del promedio indica que las personas valoran ciertos aspectos de la Empresa, pero no tienen un compromiso afectivo muy desarrollado. Se recomienda realizar un estudio profundo del compromiso y analizar los aspectos que inciden en el mismo para ejecutar programas que mejoren las diferentes variables.",
            "Poco satisfactorio":"El resultado poco satisfactorio indica que las personas no han desarrollado un compromiso de este tipo; es decir, las cuestiones que suceden dentro de la Empresa son ajenas a ellos. Es necesario, realizar estudios de Clima Organizacional y de Compromiso para implementar planes que incidan sobre las cuestiones de la cultura que están impidiendo que se genere este compromiso."
          },
          "Normativo": {
            "Muy satisfactorio":"Un resultado muy satisfactorio en esta escala significa que la persona ha desarrollado un gran compromiso normativo con su Organización; es decir sienten la obligación de continuar con la relación laboral ya sea por lo que han recibido o por cuestiones relacionadas a la personalidad de los individuos que les impiden dejar su Empresa; sin embargo, este compromiso no es el más recomendable porque no significa que la persona esté satisfecha y comprometida por convicción, sino por obligación.",
            "Satisfactorio":"Un resultado satisfactorio en esta escala, significa que las personas han desarrollado un compromiso normativo y que se mantiene dentro de la Organización por una obligación moral. Sin embargo, se debe monitorear el nivel de compromiso afectivo que debe estar en la misma escala o una mayor para que garantice la permanencia de los colaboradores no solo porque sienten que tienen que quedarse sino porque quieren hacerlo.",
            "Promedio":"Un resultado promedio significa que las personas tienen un cierto compromiso de tipo normativo. Es decir, hasta cierto punto siente una obligación de pertenecer a su Organización porque valoran algunas cosas que les han brindado. Se recomienda realizar estudios periódicos sobre este tema para identificar si existe algún otro tipo de compromiso que complemente estos resultados.",
            "Debajo del promedio":"El resultado por debajo del promedio significa que las personas tienen poco compromiso de tipo normativo. Es decir, no sienten que deben trabajar en la Organización por una obligación; no obstante se recomienda revisar la escala de compromiso afectivo para identificar si las personas están comprometidas de alguna manera con su Organización; en caso de no ser así, es indispensable estudiar este aspecto y generar planes de acción.",
            "Poco satisfactorio":"El resultado poco satisfactorio indica que no existe este tipo de compromiso; de esta manera, en caso de que las personas no se sientan responsables y cercanas a su Organización de ninguna manera, es indispensable analizar la Cultura para realizar cambios que incidan positivamente sobre este aspecto y trabajar diariamente en el fortalecimiento del compromiso."
          }
        },
        "Bienestar Psicológico": {
          "Estrés": {
            "Muy satisfactorio":"La persona posee niveles de estrés muy bajos. Es decir, no presenta sintomatología fisiológica ni psicológica asociada con este factor.",
            "Satisfactorio":"La persona posee niveles bajos de estrés; es decir, en ciertas ocasiones puede presentar sintomatología fisiológica y/o psicológica ante ciertas situaciones pero ha podido aprender a controlar. Se recomienda monitorear en un lapso de 6 a 12 meses para conocer si este resultado se mantiene.",
            "Promedio":"Este resultado indica que los niveles de estrés están en un rango normal; es decir, en la mayor parte de ambientes laborales, existe un cierto grado de estrés que puede ser positivo porque motiva a las personas a cumplir con sus actividades a tiempo y de la manera correcta; sin embargo, se deben monitorear constantemente los factores que generan estrés para mantenerlos controlados.",
            "Debajo del promedio":"Este resultado indica que la persona presenta sintomatología de estrés ya sea fisiológica y/o psicológica; es necesario realizar estudios periódicos para estar al tanto de la situación y conversar con el/la colaborador/a para consultarle si no requiere alguna otra herramienta de intervención.",
            "Poco satisfactorio":"Este resultado indica que la persona presente sintomatología muy fuerte asociada con el estrés; por lo mismo, se deben mantener reuniones periódicas y recomendar la visita a un especialista en psicoterapia, para que le a mejorar sus capacidades para enfrentar las demandas de las situaciones y disminuir poco a poco los síntomas que experimenta."
          },
          "Depresión": {
            "Muy satisfactorio":"La persona no posee síntomas que deriven en una depresión profunda o episodio depresivo.",
            "Satisfactorio":"Un resultado satisfactorio indica que la persona tiene ciertos síntomas relacionados con la depresión en situaciones puntuales; sin embargo esto no quiere decir que presente esta patología. Se recomienda realizar un nuevo estudio en el lapso de 6 meses.",
            "Promedio":"Un resultado promedio indica que la persona posee niveles moderados - bajos de depresión; es decir que, frente a algunas situaciones puede presentar sintomatología relacionada a este trastorno. Se recomienda conversar con el/la colaborador/a y realizar un plan de seguimiento para verificar que los síntomas no se agudicen.",
            "Debajo del promedio":"Este resultado indica la presencia de ciertos criterios diagnósticos de depresión; se recomienda realizar una intervención con la persona para analizar sus antecedentes frente a esta patología y en caso de que sea algo temporal, realizar una asesoría psicológica individual.",
            "Poco satisfactorio":"Este resultado indica la presencia de un trastorno mental que es frecuente en la población y que se caracteriza por la presencia de tristeza, pérdida de interés o placer, sentimientos de culpa o falta de autoestima, trastornos del sueño o del apetito, sensación de cansancio y falta de concentración. Por esto, es necesario conversar con la persona para corroborar los resultados obtenidos y, en caso de que así sea, recomendarle que empiece un tratamiento psicoterapéutico con un profesional."
          },
          "Ansiedad": {
            "Muy satisfactorio":"La persona no ha presentado síntomas relacionados a la ansiedad durante los últimos meses.",
            "Satisfactorio":"La persona ha presentado ciertos síntomas relacionados con la ansiedad; no obstante, no se han consolidado los criterios para un diagnóstico de este tipo; además, la persona se desempeña en su día a día sin ninguna limitación.  Se recomienda realizar nuevamente un diagnóstico en el lapso de 6 a 12 meses.",
            "Promedio":"Un resultado promedio indica que la persona ha experimentado ciertos síntomas relacionados a la ansiedad pero los mismos han sido por una ocasión puntual y no se han prolongado. En este sentido, se considera normal que frente a algunas situaciones aparezcan algunos signos pero que no sean recurrentes ni afecten la vida de la persona. Se recomienda conversar con la persona y en caso de que requiera, realizar una intervención psicológica mensual.",
            "Debajo del promedio":"Este resultado indica que la persona presenta sintomatología moderada de ansiedad; por esto, es necesario identificar si los síntomas obedecen a la situación actual o además existen otros factores desencadenantes; para esto, se recomienda una asesoría psicológica que permita identificar la causa del problema y trabajarla.",
            "Poco satisfactorio":"Este resultado refleja la presencia de una ansiedad que puede ser patológica porque se presenta sin la presencia de un estímulo definido, porque  la duración es prolongada o porque existe una recurrencia inmotivada que causa la disfuncionalidad en la persona. Por esto, se recomienda que se socialicen estos resultados con el/la colaborador/a y se le proponga asistir donde un profesional experto en el tema. Además, sería necesario que se realice un seguimiento para asegurarse que la ansiedad no incremente."
          }
        }
      }
    return valores[dimension][subdimension][rango_semaforo]
  }


  async generatePdfPostCovid (datos,res,host) {
    const ejs = require("ejs");
    const pdf = require("html-pdf");
    const path = require("path");
    let data = await this.mongoDB.getNoObject('reportes',datos._id_test)
    data = Object.assign(data,datos)
    data.conclusiones = data.conclusiones.replace(/\r?\n/g, '<br />')
    let test = await this.mongoDB.get('tests',data._id_test)
    const _id_empresa = test._id_empresa
    const empresa = await this.mongoDB.get('empresas',_id_empresa)
    data.filepath = empresa.filepath
    
    const datosPorGruposGenero = {
      type: "svg",
      outfile: "public/graficos/postcovid/datosPorGruposGenero.svg",
      options: {
        chart: {
            /*height: '300px',*/
            plotBackgroundColor: null,
            plotBorderWidth: null,
            plotShadow: false,
            type: 'pie'
        },
        credits: {
            enabled: false
        },
        title: {
            text: 'GÉNERO'
        },
        tooltip: {
            pointFormat: '<b>{point.percentage:.2f}%</b>'
        },
        accessibility: {
            point: {
                valueSuffix: '%'
            }
        },
        legend: {
            align: 'center',
            verticalAlign: 'top',
            x: 0,
            y: 0
        },
        plotOptions: {
            pie: {
                allowPointSelect: true,
                cursor: 'pointer',
                dataLabels: {
                    distance: -30,
                    color: 'white',
                    enabled: true,
                    format: '<b>{point.percentage:.2f} %'
                },
                showInLegend: true
            }
        },
        series: [{
            name: 'Género',
            colorByPoint: true,
            data: data.dataGenero
        }]
      }
    }

    const datosPorGruposAreas = {
      type: "svg",
      outfile: "public/graficos/postcovid/datosPorGruposAreas.svg",
      options: {
        chart: {
            type: 'bar'
        },
        credits: {
            enabled: false
        },
        title: {
            text: 'ÁREAS'
        },
        xAxis: {
            type: 'category',
            labels: {
                style: {
                    fontSize: '13px',
                    fontFamily: 'Verdana, sans-serif'
                }
            }
        },
        yAxis: {
            min: 0,
            title: {
                text: 'Cantidad de personas'
            }
        },
        legend: {
            enabled: false
        },
        tooltip: {
            pointFormat: '<b>{point.y:.0f} personas</b>'
        },
        plotOptions: {
            column: {
                borderRadius: 5
            }
        },
        series: [{
            name: 'Cantidad de personas',
            data: data.dataAreas,
            dataLabels: {
                enabled: true,
                color: '#000000',
                align: 'center',
                
            }
        }]
      }
    }

    const datosPorGruposEdad = {
      type: "svg",
      outfile: "public/graficos/postcovid/datosPorGruposEdad.svg",
      options: {
        chart: {
            type: 'bar'
        },
        credits: {
            enabled: false
        },
        title: {
            text: 'Rango de edad'
        },
        xAxis: {
            type: 'category',
            labels: {
                style: {
                    fontSize: '13px',
                    fontFamily: 'Verdana, sans-serif'
                }
            }
        },
        yAxis: {
            min: 0,
            //tickInterval: 2,
            title: {
                text: 'Número de personas'
            }
        },
        legend: {
            enabled: false
        },
        tooltip: {
            pointFormat: '<b>{point.y:.0f} personas</b>'
        },
        plotOptions: {
            column: {
                borderRadius: 5
            }
        },
        series: [{
            name: 'Número de personas',
            data: data.dataEdad,
            dataLabels: {
                enabled: true,
                color: '#000000',
                align: 'center',
                
            }
        }]
      }
    }


    chartExporter.initPool({
      maxWorkers: 8,
      initialWorkers: 8,
      workLimit: 50,
      queueSize: 500
    });
    const that = this
    Promise.all([
      this.generateBase64Chart(datosPorGruposGenero),
      this.generateBase64Chart(datosPorGruposAreas),
      this.generateBase64Chart(datosPorGruposEdad),
      this.processGenerateBase64ChartPromiseAllSubdimensiones(data.satisfaccion.subdimensiones),
      this.processGenerateBase64ChartPromiseAllSubdimensiones(data.compromiso.subdimensiones),
      this.processGenerateBase64ChartPromiseAllBienestarIndividualArea(data.individual_bienestar)
    ]).then(values => {
      chartExporter.killPool();
      data = Object.assign(data,{
        datosPorGruposGenero:values[0],
        datosPorGruposAreas:values[1],
        datosPorGruposEdad:values[2],
        subdimensionesSatisfaccion:values[3],
        subdimensionesCompromiso:values[4],
        individualBienestar:values[5],
        host:host
      })
      ejs.renderFile(path.join(__dirname, '/../views/', "reporte_postcovid.ejs"), data, (err, html) => {
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
            const filename = "reporte_postcovid_"+data._id_test+".pdf"
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
                        message: "PDF link PostCovid."
                    });
                    
                }
            })
        }
      })
    }).catch(err => console.log("ERROR en generatePdfPostCovid: "+err.message))


    
      /*
        data = Object.assign(data,{image64})
        ejs.renderFile(path.join(__dirname, '/../views/', "reporte_clima.ejs"), data, (err, data) => {
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
              pdf.create(data, options).toFile(path.join(__dirname, '/../reportes/', "reporte_clima.pdf"), function (err, data) {
                  if (err) {
                      res.send(err);
                  } else {
                      res.send("File created successfully");
                  }
              })
          }
        })
      */
    //data = Object.assign(data,{image64})

    
  }




  /* **************************************************************** */
  /* ****************** DIAGNÓSTICO MOTIVACIONAL ******************** */

  async generateDataDiagnosticoGraficos(datos) {
    
    const data =  {
        _id: datos._id_test,
        motivacion_general: datos.motivacion_general,
        dataGenero: await this.getDataGenero(datos._id_test),
        dataAntiguedad: await this.getDataAntiguedad(datos._id_test),
        dataAreas: await this.getDataAreas(datos._id_test),
        promedioGeneral: await this.getPromedioGeneralDiagnostico(datos._id_test,datos.motivacion_general),
        dataPromedioPorAreas: await this.getDataPromedioPorAreasDiagnostico(datos._id_test,datos.motivacion_general),
        dataPromedioPorGenero: await this.getDataPromedioPorGeneroDiagnostico(datos._id_test,datos.motivacion_general),
        dataPromedioPorAntiguedad: await this.getDataPromedioPorAntiguedadDiagnostico(datos._id_test,datos.motivacion_general),
        dataIndividual: await this.getDataIndividualArea(datos._id_test,datos.factores_higienicos_individual,
            datos.factores_motivacionales_individual),
        dataIncentivos: await this.getDataIncentivosPorArea(datos._id_test)
    }
    await this.mongoDB.deleteFisicamente('reportes',{_id:datos._id_test})
    let _id_reporte = await this.mongoDB.create('reportes',data)
    const resultado = await this.mongoDB.getNoObject('reportes',datos._id_test)

    return resultado

  }

  async getDataFactoresMotivacionales(_id_test,seccion,semaforo,_id_users) {
    let puntajeRespondidasAutorrealizacion = await this.mongoDB.puntajeRespondidasPorSeccion('respuestas',_id_test,seccion,"Autorrealización / Reconocimientos",_id_users)
    puntajeRespondidasAutorrealizacion = puntajeRespondidasAutorrealizacion.length == 1 ? puntajeRespondidasAutorrealizacion[0].sumaTotal : 0
    
    let puntajeRespondidasTareas = await this.mongoDB.puntajeRespondidasPorSeccion('respuestas',_id_test,seccion,"Tareas",_id_users)
    puntajeRespondidasTareas = puntajeRespondidasTareas.length == 1 ? puntajeRespondidasTareas[0].sumaTotal : 0
    
    let puntajeRespondidasCrecimiento = await this.mongoDB.puntajeRespondidasPorSeccion('respuestas',_id_test,seccion,"Crecimiento",_id_users)
    puntajeRespondidasCrecimiento = puntajeRespondidasCrecimiento.length == 1 ? puntajeRespondidasCrecimiento[0].sumaTotal : 0

    let resultado = [{
        name: 'Alto',
        color:"#98c415",
        data: [ this.checkValor(semaforo.autorrealizacion,puntajeRespondidasAutorrealizacion,'satisfactorio'),
                this.checkValor(semaforo.tareas,puntajeRespondidasTareas,'satisfactorio'), 
                this.checkValor(semaforo.crecimiento,puntajeRespondidasCrecimiento,'satisfactorio') ],
        dataLabels: {        
            enabled: true,
            filter: {
                property: 'y',
                operator: '>',
                value: 0
            }
        },
      }, {
        name: 'Medio',
        color: '#ffd93b',
        data: [ this.checkValor(semaforo.autorrealizacion,puntajeRespondidasAutorrealizacion,'intermedio'),
                this.checkValor(semaforo.tareas,puntajeRespondidasTareas,'intermedio'), 
                this.checkValor(semaforo.crecimiento,puntajeRespondidasCrecimiento,'intermedio') ],
        dataLabels: {        
            enabled: true,
            filter: {
                property: 'y',
                operator: '>',
                value: 0
            }
        },
      }, {
        name: 'Bajo',
        color: '#ed1c24',
        data: [ this.checkValor(semaforo.autorrealizacion,puntajeRespondidasAutorrealizacion,'bajo'),
                this.checkValor(semaforo.tareas,puntajeRespondidasTareas,'bajo'), 
                this.checkValor(semaforo.crecimiento,puntajeRespondidasCrecimiento,'bajo') ],
        dataLabels: {        
            enabled: true,
            filter: {
                property: 'y',
                operator: '>',
                value: 0
            }
        },
      }]

    return resultado;


  }

  async getDataFactoresHigienicos(_id_test,seccion,semaforo,_id_users) {
    
    let puntajeRespondidasEstatus = await this.mongoDB.puntajeRespondidasPorSeccion('respuestas',_id_test,seccion,"Estatus",_id_users)
    puntajeRespondidasEstatus = puntajeRespondidasEstatus.length == 1 ? puntajeRespondidasEstatus[0].sumaTotal : 0
    
    let puntajeRespondidasRelacionesSuperiores = await this.mongoDB.puntajeRespondidasPorSeccion('respuestas',_id_test,seccion,"Relaciones con Superiores",_id_users)
    puntajeRespondidasRelacionesSuperiores = puntajeRespondidasRelacionesSuperiores.length == 1 ? puntajeRespondidasRelacionesSuperiores[0].sumaTotal : 0
    
    let puntajeRespondidasRelacionesLaborales = await this.mongoDB.puntajeRespondidasPorSeccion('respuestas',_id_test,seccion,"Relaciones laborales",_id_users)
    puntajeRespondidasRelacionesLaborales = puntajeRespondidasRelacionesLaborales.length == 1 ? puntajeRespondidasRelacionesLaborales[0].sumaTotal : 0
    
    let puntajeRespondidasPoliticasEmpresa = await this.mongoDB.puntajeRespondidasPorSeccion('respuestas',_id_test,seccion,"Políticas de la Empresa",_id_users)
    puntajeRespondidasPoliticasEmpresa = puntajeRespondidasPoliticasEmpresa.length == 1 ? puntajeRespondidasPoliticasEmpresa[0].sumaTotal : 0
    
    let puntajeRespondidasCondicionesTrabajo = await this.mongoDB.puntajeRespondidasPorSeccion('respuestas',_id_test,seccion,"Condiciones de trabajo",_id_users)
    puntajeRespondidasCondicionesTrabajo = puntajeRespondidasCondicionesTrabajo.length == 1 ? puntajeRespondidasCondicionesTrabajo[0].sumaTotal : 0    

    let resultado = [{
        name: 'Alto',
        color:"#98c415",
        data: [ this.checkValor(semaforo.estatus,puntajeRespondidasEstatus,'satisfactorio'),
                this.checkValor(semaforo.relaciones_superiores,puntajeRespondidasRelacionesSuperiores,'satisfactorio'), 
                this.checkValor(semaforo.relaciones_laborales,puntajeRespondidasRelacionesLaborales,'satisfactorio'), 
                this.checkValor(semaforo.politicas_empresa,puntajeRespondidasPoliticasEmpresa,'satisfactorio'), 
                this.checkValor(semaforo.condiciones_trabajo,puntajeRespondidasCondicionesTrabajo,'satisfactorio') ],
        dataLabels: {        
            enabled: true,
            filter: {
                property: 'y',
                operator: '>',
                value: 0
            }
        },
      }, {
        name: 'Medio',
        color: '#ffd93b',
        data: [ this.checkValor(semaforo.estatus,puntajeRespondidasEstatus,'intermedio'),
                this.checkValor(semaforo.relaciones_superiores,puntajeRespondidasRelacionesSuperiores,'intermedio'), 
                this.checkValor(semaforo.relaciones_laborales,puntajeRespondidasRelacionesLaborales,'intermedio'), 
                this.checkValor(semaforo.politicas_empresa,puntajeRespondidasPoliticasEmpresa,'intermedio'), 
                this.checkValor(semaforo.condiciones_trabajo,puntajeRespondidasCondicionesTrabajo,'intermedio') ],
        dataLabels: {        
            enabled: true,
            filter: {
                property: 'y',
                operator: '>',
                value: 0
            }
        },
      }, {
        name: 'Bajo',
        color: '#ed1c24',
        data: [ this.checkValor(semaforo.estatus,puntajeRespondidasEstatus,'bajo'),
                this.checkValor(semaforo.relaciones_superiores,puntajeRespondidasRelacionesSuperiores,'bajo'), 
                this.checkValor(semaforo.relaciones_laborales,puntajeRespondidasRelacionesLaborales,'bajo'), 
                this.checkValor(semaforo.politicas_empresa,puntajeRespondidasPoliticasEmpresa,'bajo'), 
                this.checkValor(semaforo.condiciones_trabajo,puntajeRespondidasCondicionesTrabajo,'bajo') ],
        dataLabels: {        
            enabled: true,
            filter: {
                property: 'y',
                operator: '>',
                value: 0
            }
        },
      }]

    return resultado;


  }

  checkValor(semaforo,puntajeRespondidas,item){
    let valor = 0
    if (puntajeRespondidas >= semaforo[item].desde && puntajeRespondidas <= semaforo[item].hasta)
        valor = puntajeRespondidas
    return valor
  }

  async getDataPerfilMotivacional(_id_test,seccion,tipo_seccion,_id_users) {
    let cantidadRespuestas = await this.mongoDB.cantidadRespuestasPorSeccion('respuestas',_id_test,seccion,tipo_seccion,_id_users)
    cantidadRespuestas = cantidadRespuestas.length == 1 ? cantidadRespuestas[0].cantidad : 0

    let puntajePreguntaMaxima = await this.mongoDB.puntajePreguntaMaxima('preguntas',_id_test,seccion)
    puntajePreguntaMaxima = puntajePreguntaMaxima.length == 1 ? puntajePreguntaMaxima[0].maxima : 0

    const puntajeExitoso = cantidadRespuestas * puntajePreguntaMaxima

    let puntajeRespondidas = await this.mongoDB.puntajeRespondidasPorSeccion('respuestas',_id_test,seccion,tipo_seccion,_id_users)
    puntajeRespondidas = puntajeRespondidas.length == 1 ? puntajeRespondidas[0].sumaTotal : 0

    let porcentajeGeneral = 0
    if (puntajeExitoso != 0)
        porcentajeGeneral = puntajeRespondidas * 100 / puntajeExitoso
    porcentajeGeneral = Math.round(porcentajeGeneral * 100) / 100
    return porcentajeGeneral
  }

  async getPromedioGeneralDiagnostico(_id_test,semaforo,_id_users=[]) {
    let cantidadRespuestas = await this.mongoDB.cantidadRespuestasPorSeccion('respuestas',_id_test,"4",null,_id_users)
    cantidadRespuestas = cantidadRespuestas.length == 1 ? cantidadRespuestas[0].cantidad : 0

    let puntajePreguntaMaxima = await this.mongoDB.puntajePreguntaMaxima('preguntas',_id_test,"4")
    puntajePreguntaMaxima = puntajePreguntaMaxima.length == 1 ? puntajePreguntaMaxima[0].maxima : 0

    const puntajeExitoso = cantidadRespuestas * puntajePreguntaMaxima

    let puntajeRespondidas = await this.mongoDB.puntajeRespondidasPorSeccion('respuestas',_id_test,"4",null,_id_users)
    
    puntajeRespondidas = puntajeRespondidas.length == 1 ? puntajeRespondidas[0].sumaTotal : 0


    let porcentajeGeneral = puntajeRespondidas * 100 / puntajeExitoso
    porcentajeGeneral = Math.round(porcentajeGeneral * 100) / 100
    
    let resultado = {porcentaje: 0,label:""}
    for (const item in semaforo) {
      if (porcentajeGeneral >= semaforo[item].desde && porcentajeGeneral <= semaforo[item].hasta){
        resultado = {porcentaje: porcentajeGeneral,label:semaforo[item].label,color:semaforo[item].color}
        break
      }
    }

    return resultado
    
  }


  async getDataPromedioPorAreasDiagnostico(_id_test,semaforo) {
    let test = await this.mongoDB.get('tests',_id_test)
    const _id_empresa = test._id_empresa

    let areas = await this.mongoDB.getAll('departamentos',{_id_empresa})
    let areasFormat = []
    for (let index = 0; index < areas.length; index++) {
      const element = areas[index];
      const _id_departamento = String(element._id)
      const resIdsUsers = await this.mongoDB.getAll('users_tests',{_id_test,_id_departamento,_id_empresa},{_id_usuario:1})
      const ids_users = resIdsUsers.map(function(val) {
        return val._id_usuario
      }) || []
      if (ids_users.length > 0) {
        const promedioArea = await this.getPromedioGeneralDiagnostico(_id_test,semaforo,ids_users)
        areasFormat.push({name:element.nombre,y:promedioArea.porcentaje,color:promedioArea.color})
      }
    }


    areasFormat.sort( this.compare )

    const response = {data: areasFormat,menor:areasFormat[0],mayor:areasFormat[areasFormat.length-1]}

    return response

  }

  async getDataPromedioPorGeneroDiagnostico(_id_test,semaforo) {
    let test = await this.mongoDB.get('tests',_id_test)
    let generos = []
    const _id_empresa = test._id_empresa
    const resIdsUsersMasculino = await this.mongoDB.getAll('users',{sexo:'M',delete:false,rol:'user'},{_id:1})
    const ids_users_masculino = resIdsUsersMasculino.map(function(val) {
      return String(val._id)
    }) || []
    let resIdsUsers = await this.mongoDB.getAll('users_tests',
        {_id_test,_id_empresa,_id_usuario:{$in:ids_users_masculino}},{_id_usuario:1})
    let ids_users = resIdsUsers.map(function(val) {
      return val._id_usuario
    }) || []
    const promedioMasculino = await this.getPromedioGeneralDiagnostico(_id_test,semaforo,ids_users)
    generos.push({name:'Masculino',y:promedioMasculino.porcentaje,color:promedioMasculino.color})


    const resIdsUsersFemenino = await this.mongoDB.getAll('users',{sexo:'F',delete:false,rol:'user'},{_id:1})
    const ids_users_femenino = resIdsUsersFemenino.map(function(val) {
      return String(val._id)
    }) || []
    resIdsUsers = await this.mongoDB.getAll('users_tests',
        {_id_test,_id_empresa,_id_usuario:{$in:ids_users_femenino}},{_id_usuario:1})
    ids_users = resIdsUsers.map(function(val) {
      return val._id_usuario
    }) || []
    const promedioFemenino = await this.getPromedioGeneralDiagnostico(_id_test,semaforo,ids_users)
    generos.push({name:'Femenino',y:promedioFemenino.porcentaje,color:promedioFemenino.color})

    generos.sort( this.compare )

    return generos

  }

  async getDataPromedioPorAntiguedadDiagnostico(_id_test,semaforo){

    const arrayAntiguedades = [
      {desde: 1, hasta: 6, label: 'De 1 a 6 meses'},
      {desde: 7, hasta: 18, label: 'De 7 a 18 meses'},
      {desde: 19, hasta: 36, label: 'De 19 a 36 meses'},
      {desde: 37, hasta: 60, label: 'De 37 a 60 meses'},
      {desde: 61, hasta: 120, label: 'De 61 a 120 meses'},
      {desde: 121, hasta: null, label: 'De 121 en adelante'}
    ]

    let test = await this.mongoDB.get('tests',_id_test)
    const _id_empresa = test._id_empresa
    
    for (let index = 0; index < arrayAntiguedades.length; index++) {
      const element = arrayAntiguedades[index];
      
      const resIdsUsers = await this.mongoDB.getAll('users_tests',
      {_id_test,_id_empresa,antiguedad:{$gte:element.desde,$lte:element.hasta}},{_id_usuario:1})
      const ids_users = resIdsUsers.map(function(val) {
        return val._id_usuario
      }) || []

      const promedioAntiguedad = await this.getPromedioGeneralDiagnostico(_id_test,semaforo,ids_users)
      arrayAntiguedades[index] = {name:element.label,y:promedioAntiguedad.porcentaje,color:promedioAntiguedad.color}
    }
    arrayAntiguedades.sort( this.compare )

    return arrayAntiguedades

  }

  async usuariosPorTests(datos) {
      const userstests = await this.mongoDB.getAll('users_tests',{_id_test:datos._id_test})
      for (let index = 0; index < userstests.length; index++) {
        const _id_user = userstests[index]._id_usuario;
        const user = await this.mongoDB.get('users',_id_user)
        userstests[index] = {index: index ,email: user.email, otp: user.otp}
      }
      return userstests
  }

  async procesoEliminarRespuestas(datos) {
    const _id_test = datos._id_test
    const seccion = datos.seccion
    const respuestas = await this.mongoDB.getRespuestasPorSeccion('respuestas',_id_test,seccion)
    console.dir(respuestas.length)
    for (let index = 0; index < respuestas.length; index++) {
        const _id_respuesta = respuestas[index]._id;
        await this.mongoDB.deleteFisicamente('respuestas',{_id:_id_respuesta})
    }
  }

  async promedioSeccionDiagnosticoIncentivos(_id_test,opcion,tipo_seccion,_ids_users) {
    let cantidadRespuestas = await this.mongoDB.cantidadRespuestasIncentivos('respuestas',_id_test,opcion,tipo_seccion,_ids_users)
    cantidadRespuestas = cantidadRespuestas.length == 1 ? cantidadRespuestas[0].cantidad : 0
    return cantidadRespuestas;
    
    
    
    /*
    let puntajePreguntaMaxima = await this.mongoDB.puntajePreguntaMaxima('preguntas',_id_test,"5")
    puntajePreguntaMaxima = puntajePreguntaMaxima.length == 1 ? puntajePreguntaMaxima[0].maxima : 0
    const puntajeExitoso = cantidadRespuestas * puntajePreguntaMaxima
    let puntajeRespondidas = await this.mongoDB.puntajeRespondidasIncentivos('respuestas',_id_test,seccion,tipo_seccion,ids_users)
    puntajeRespondidas = puntajeRespondidas.length == 1 ? puntajeRespondidas[0].sumaTotal : 0
    let porcentajeGeneral = puntajeRespondidas * 100 / puntajeExitoso
    porcentajeGeneral = Math.round(porcentajeGeneral * 100) / 100*/
  }

    async getDataIncentivosGenerales(_id_test,_ids_users=[]) {
        let tipo_seccion = "Incentivos que más valora"
        const cantidadIncentivoSeguroVida = await this.promedioSeccionDiagnosticoIncentivos(
            _id_test,"Seguro de vida y de accidentes",tipo_seccion,_ids_users)
        const cantidadIncentivoCapacitaciones = await this.promedioSeccionDiagnosticoIncentivos(
            _id_test,"Capacitaciones continuas",tipo_seccion,_ids_users)
        const cantidadIncentivoPremios = await this.promedioSeccionDiagnosticoIncentivos(
            _id_test,"Premios por antigüedad",tipo_seccion,_ids_users)
        const cantidadIncentivoBonos = await this.promedioSeccionDiagnosticoIncentivos(
            _id_test,"Bonos económicos anuales",tipo_seccion,_ids_users)
        
        let total = cantidadIncentivoSeguroVida + cantidadIncentivoCapacitaciones + cantidadIncentivoBonos + cantidadIncentivoPremios
        const porcentajeSeguroVida = cantidadIncentivoSeguroVida * 100 / total
        const porcentajeCapacitaciones = cantidadIncentivoCapacitaciones * 100 / total
        const porcentajePremios = cantidadIncentivoPremios * 100 / total
        const porcentajeBonos = 100 - (Math.round(porcentajeSeguroVida * 100) / 100 +
                                        Math.round(porcentajeCapacitaciones * 100) / 100 + 
                                        Math.round(porcentajePremios * 100) / 100)
        let incentivosMasValora = []
        if (porcentajeSeguroVida > 0){
            incentivosMasValora.push({
                name: "Seguro de vida y de accidentes",
                y: Math.round(porcentajeSeguroVida * 100) / 100,
                color: '#2e5495'
            })
        }
        if (porcentajeCapacitaciones > 0){
            incentivosMasValora.push({
                name: "Capacitaciones continuas",
                y: Math.round(porcentajeCapacitaciones * 100) / 100,
                color: '#bdbdbd'
            })
        }
        if (porcentajePremios > 0){
            incentivosMasValora.push({
                name: "Premios por antigüedad",
                y: Math.round(porcentajePremios * 100) / 100,
                color: '#727272'
            })
        }
        if (porcentajeBonos > 0){
            incentivosMasValora.push({
                name: "Bonos económicos anuales",
                y: Math.round(porcentajeBonos * 100) / 100,
                color: '#cc362b'
            })
        }

        tipo_seccion = "Lo que más le motiva"
        const cantidadIncentivoBuenas = await this.promedioSeccionDiagnosticoIncentivos(
            _id_test,"Buenas relaciones interpersonales",tipo_seccion,_ids_users)
        const cantidadIncentivoCumplimiento = await this.promedioSeccionDiagnosticoIncentivos(
            _id_test,"Cumplimiento de la jornada laboral (no existen horarios extendidos)",tipo_seccion,_ids_users)
        const cantidadIncentivoPosibilidades = await this.promedioSeccionDiagnosticoIncentivos(
            _id_test,"Posibilidades de crecimiento interno (ascensos)",tipo_seccion,_ids_users)
        const cantidadIncentivoApertura = await this.promedioSeccionDiagnosticoIncentivos(
            _id_test,"Apertura de los jefes y directivos para escuchar",tipo_seccion,_ids_users)
        
        total = cantidadIncentivoBuenas + cantidadIncentivoCumplimiento + cantidadIncentivoPosibilidades + cantidadIncentivoApertura
        const porcentajeBuenas = cantidadIncentivoBuenas * 100 / total
        const porcentajeCumplimiento = cantidadIncentivoCumplimiento * 100 / total
        const porcentajePosibilidades = cantidadIncentivoPosibilidades * 100 / total
        const porcentajeApertura = 100 - (Math.round(porcentajeBuenas * 100) / 100 +
                                        Math.round(porcentajeCumplimiento * 100) / 100 + 
                                        Math.round(porcentajePosibilidades * 100) / 100)

        let loQueMasMotiva = []
        
        if (porcentajeBuenas > 0) {
            loQueMasMotiva.push({
                name: "Buenas relaciones interpersonales",
                y: Math.round(porcentajeBuenas * 100) / 100,
                color: '#2e5495'
            })
        }
        if (porcentajeCumplimiento > 0){
            loQueMasMotiva.push({
                name: "Cumplimiento de la jornada laboral (no existen horarios extendidos)",
                y: Math.round(porcentajeCumplimiento * 100) / 100,
                color: '#bdbdbd'
            })
        }
        if (porcentajePosibilidades > 0){
            loQueMasMotiva.push({
                name: "Posibilidades de crecimiento interno (ascensos)",
                y: Math.round(porcentajePosibilidades * 100) / 100,
                color: '#727272'
            })
        }
        if (porcentajeApertura > 0){
            loQueMasMotiva.push({
                name: "Apertura de los jefes y directivos para escuchar",
                y: Math.round(porcentajeApertura * 100) / 100,
                color: '#cc362b'
            })
        }


        tipo_seccion = "Lo que más le desmotiva"
        const cantidadIncentivoCarga = await this.promedioSeccionDiagnosticoIncentivos(
            _id_test,"Carga laboral",tipo_seccion,_ids_users)
        const cantidadIncentivoSueldos = await this.promedioSeccionDiagnosticoIncentivos(
            _id_test,"Sueldos y salarios",tipo_seccion,_ids_users)
        const cantidadIncentivoFalta = await this.promedioSeccionDiagnosticoIncentivos(
            _id_test,"Falta de implicación y empoderamiento con la Empresa",tipo_seccion,_ids_users)
        const cantidadIncentivoAmbiente = await this.promedioSeccionDiagnosticoIncentivos(
            _id_test,"El ambiente que se percibe dentro de la Organización",tipo_seccion,_ids_users)
        
        total = cantidadIncentivoCarga + cantidadIncentivoSueldos + cantidadIncentivoFalta + cantidadIncentivoAmbiente
        const porcentajeCarga = cantidadIncentivoCarga * 100 / total
        const porcentajeSueldos = cantidadIncentivoSueldos * 100 / total
        const porcentajeFalta = cantidadIncentivoFalta * 100 / total
        const porcentajeAmbiente = 100 - (Math.round(porcentajeCarga * 100) / 100 +
                                        Math.round(porcentajeSueldos * 100) / 100 + 
                                        Math.round(porcentajeFalta * 100) / 100)

        let loQueMasDesmotiva = []
        if (porcentajeCarga > 0){
            loQueMasDesmotiva.push({
                name: "Carga laboral",
                y: Math.round(porcentajeCarga * 100) / 100,
                color: '#2e5495'
            })
        }
        if (porcentajeSueldos > 0){
            loQueMasDesmotiva.push({
                name: "Sueldos y salarios",
                y: Math.round(porcentajeSueldos * 100) / 100,
                color: '#bdbdbd'
            })
        }
        if (porcentajeFalta > 0){
            loQueMasDesmotiva.push({
                name: "Falta de implicación y empoderamiento con la Empresa",
                y: Math.round(porcentajeFalta * 100) / 100,
                color: '#727272'
            })
        }
        if (porcentajeAmbiente > 0){
            loQueMasDesmotiva.push({
                name: "El ambiente que se percibe dentro de la Organización",
                y: Math.round(porcentajeAmbiente * 100) / 100,
                color: '#cc362b'
            })
        }
        
        tipo_seccion = "Incentivos que espera"
        const cantidadIncentivoCumpleanos = await this.promedioSeccionDiagnosticoIncentivos(
            _id_test,"Un reconocimiento por mi cumpleaños",tipo_seccion,_ids_users)
        const cantidadIncentivoMes = await this.promedioSeccionDiagnosticoIncentivos(
            _id_test,"Un reconocimiento por el empleado del mes",tipo_seccion,_ids_users)
        const cantidadIncentivoAgasajos = await this.promedioSeccionDiagnosticoIncentivos(
            _id_test,"Agasajos por fechas importantes (día de la madre, del padre, del niño, navidad)",tipo_seccion,_ids_users)
        const cantidadIncentivoSorteos = await this.promedioSeccionDiagnosticoIncentivos(
            _id_test,"Sorteos para una comida, entradas al cine, etc. por antigüedad",tipo_seccion,_ids_users)
        
        total = cantidadIncentivoCumpleanos + cantidadIncentivoMes + cantidadIncentivoAgasajos + cantidadIncentivoSorteos
        const porcentajeCumpleanos = cantidadIncentivoCumpleanos * 100 / total
        const porcentajeMes = cantidadIncentivoMes * 100 / total
        const porcentajeAgasajos = cantidadIncentivoAgasajos * 100 / total
        const porcentajeSorteos = 100 - (Math.round(porcentajeCumpleanos * 100) / 100 +
                                        Math.round(porcentajeMes * 100) / 100 + 
                                        Math.round(porcentajeAgasajos * 100) / 100)
        
        let incentivosEspera = []

        if (porcentajeCumpleanos > 0){
            incentivosEspera.push({
                name: "Un reconocimiento por mi cumpleaños",
                y: Math.round(porcentajeCumpleanos * 100) / 100,
                color: '#2e5495'
            })
        }
        if (porcentajeMes > 0){
            incentivosEspera.push({
                name: "Un reconocimiento por el empleado del mes",
                y: Math.round(porcentajeMes * 100) / 100,
                color: '#bdbdbd'
            })
        }
        if (porcentajeAgasajos > 0){
            incentivosEspera.push({
                name: "Agasajos por fechas importantes (día de la madre, del padre, del niño, navidad)",
                y: Math.round(porcentajeAgasajos * 100) / 100,
                color: '#727272'
            })
        }
        if (porcentajeSorteos > 0){
            incentivosEspera.push({
                name: "Sorteos para una comida, entradas al cine, etc. por antigüedad",
                y: Math.round(porcentajeSorteos * 100) / 100,
                color: '#cc362b'
            })
        }

        return {
          incentivosMasValora,
          loQueMasMotiva,
          loQueMasDesmotiva,
          incentivosEspera
        }



    }


  async getDataIncentivos(_id_test) {
    return await this.getDataIncentivosGenerales(_id_test)
  }

  async getDataIncentivosPorArea(_id_test) {
    let test = await this.mongoDB.get('tests',_id_test)
    const _id_empresa = test._id_empresa
    let areas = await this.mongoDB.getAll('departamentos',{_id_empresa})
    let areasFormat = []
    for (let index = 0; index < areas.length; index++) {
      const element = areas[index];
      const _id_departamento = String(element._id)
      const resIdsUsers = await this.mongoDB.getAll('users_tests',{_id_test,_id_departamento,_id_empresa},{_id_usuario:1})
      const ids_users = resIdsUsers.map(function(val) {
        return val._id_usuario
      }) || []
      if (ids_users.length > 0){
        const promedioArea = await this.getDataIncentivosGenerales(_id_test,ids_users)
        areasFormat.push({area:element.nombre,data:promedioArea})
      }
    }
    areasFormat.sort( this.compare )
    const generales = await this.getDataIncentivosGenerales(_id_test)
    areasFormat.unshift({area:"Generales",data:generales})

    return areasFormat
  }

  async getDataIndividualArea(_id_test,semaforo,dimension) {
    let subdimensiones = ['Dirección','Relaciones entre equipo','Autorrealización',
    'Implicación','Organización del trabajo','Innovación','Condiciones','Información'];
    if (dimension == 'Bienestar Psicológico'){
      subdimensiones = ['Estrés','Depresión','Ansiedad']
    }else if(dimesion == 'Compromiso'){
      subdimensiones = ['Afectivo','Normativo']
    }
    
    let test = await this.mongoDB.get('tests',_id_test)
    const _id_empresa = test._id_empresa
    let respuesta = []
    let areas = await this.mongoDB.getAll('departamentos',{_id_empresa})
    
    for (let index = 0; index < areas.length; index++) {
      const element = areas[index];
      const _id_departamento = String(element._id)
      const nombre_departamento = element.nombre
      const result = {
        area: nombre_departamento,
        usuarios:[]
      }
      const usuariosPorArea = await this.mongoDB.getAll('users_tests',{_id_test,_id_departamento,_id_empresa,delete:false},{_id_usuario:1,_id_cargo:1})
      for (let index2 = 0; index2 < usuariosPorArea.length; index2++) {
        const elementUser = usuariosPorArea[index2]
        const _id_user = [elementUser._id_usuario]
        const _id_cargo = elementUser._id_cargo
        const cargo = await this.mongoDB.get('cargos',_id_cargo)
        const user = await this.mongoDB.get('users',_id_user[0]);
        const iniciales = `${user.nombre.substr(0,1)}${user.apellido.substr(0,1)}`
        const usuario = {
            title: `Bienestar Psicológico: ${cargo.nombre} (${iniciales})`,
            data: []
        }
        for (let i = 0; i < subdimensiones.length; i++) {
          const subdimension = subdimensiones[i];
          const valorPromedio = await this.getPromedioGeneral(_id_test,semaforo,dimension,subdimension,_id_user)
          const texto = this.obtenerTextoPorSemaforoDimensionSubdimension(dimension,subdimension,valorPromedio.label)
          usuario.data.push({name:subdimension,color:valorPromedio.color,data:[valorPromedio.porcentaje],texto})
        }
        result.usuarios.push(usuario)
      }

      if (result.usuarios.length > 0)
        respuesta.push(result)
      
    }
    return respuesta

  }
  

  processValoresPorSubdimension(semaforo,subdimension,puntaje,color) {
    return {
      name: subdimension,
      color:color,
      data: data,
      dataLabels: {        
          enabled: true,
          filter: {
              property: 'y',
              operator: '>',
              value: 0
          }
      },
    }
  }




}

module.exports = ReportesPostCovidService;
