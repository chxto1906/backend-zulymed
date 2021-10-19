
const MongoLib = require("../lib/mongo");
const { ObjectId } = require("mongodb");
const chartExporter = require("highcharts-export-server");
const { dir } = require("console");

class ReportesService {
  constructor() {
    this.mongoDB = new MongoLib();
  }




  /* **************************************************************** */
  /* ************************ CLIMA LABORAL ************************* */

  async generateDataClimaGraficos(datos) {
    
    

    return {
        dataGenero: await this.getDataGenero(datos._id_test),
        dataAntiguedad: await this.getDataAntiguedad(datos._id_test),
        dataAreas: await this.getDataAreas(datos._id_test),
        promedioGeneral: await this.getPromedioGeneral(datos._id_test,datos.semaforo),
        dataPromedioPorAreas: await this.getDataPromedioPorAreas(datos._id_test,datos.semaforo),
        dataPromedioPorGenero: await this.getDataPromedioPorGenero(datos._id_test,datos.semaforo),
        dataPromedioPorAntiguedad: await this.getDataPromedioPorAntiguedad(datos._id_test,datos.semaforo),
        dataPorCadaDimension: await this.getDataPorCadaDimension(datos._id_test,datos.semaforo)
    }
    /*const result = await this.mongoDB.getAllLikeSizeLimit(this.collection, query);
    return result;*/
  }


  /* **************************************************************** */
  /* ************************ POSTCOVID ************************* */

  async generateDataPostCovidGraficos(datos) {
    
    

    const data =  {
        _id: datos._id_test,
        dataGenero: await this.getDataGenero(datos._id_test),
        dataAntiguedad: await this.getDataAntiguedad(datos._id_test),
        dataAreas: await this.getDataAreas(datos._id_test),
        promedioGeneral: await this.getPromedioGeneral(datos._id_test,datos.semaforo),
        dataPromedioPorAreas: await this.getDataPromedioPorAreas(datos._id_test,datos.semaforo),
        dataPromedioPorGenero: await this.getDataPromedioPorGenero(datos._id_test,datos.semaforo),
        dataPromedioPorAntiguedad: await this.getDataPromedioPorAntiguedad(datos._id_test,datos.semaforo),
        dataPorCadaDimension: await this.getDataPorCadaDimension(datos._id_test,datos.semaforo)
    }

    await this.mongoDB.deleteFisicamente('reportes',{_id:datos._id_test})
    let _id_reporte = await this.mongoDB.create('reportes',data)
    const resultado = await this.mongoDB.getNoObject('reportes',datos._id_test)

    return resultado

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

  async getDataAntiguedad(_id_test) {
    let cantidadTotal = await this.mongoDB.getCantidadTotalUsuariosByTest('users_tests',_id_test)
    cantidadTotal = cantidadTotal.length == 1 ? cantidadTotal[0].cantidad : 0

    let cantidad1A6 = await this.mongoDB.getCantidadUsuariosByTestAndAntiguedad('users_tests',_id_test,1,6)
    cantidad1A6 = cantidad1A6.length == 1 ? cantidad1A6[0].cantidad : 0
    const porcentaje1A6 = cantidad1A6 * 100 / cantidadTotal

    let cantidad7A18 = await this.mongoDB.getCantidadUsuariosByTestAndAntiguedad('users_tests',_id_test,7,18)
    cantidad7A18 = cantidad7A18.length == 1 ? cantidad7A18[0].cantidad : 0
    const porcentaje7A18 = cantidad7A18 * 100 / cantidadTotal

    let cantidad19A36 = await this.mongoDB.getCantidadUsuariosByTestAndAntiguedad('users_tests',_id_test,19,36)
    cantidad19A36 = cantidad19A36.length == 1 ? cantidad19A36[0].cantidad : 0
    const porcentaje19A36 = cantidad19A36 * 100 / cantidadTotal

    let cantidad37A60 = await this.mongoDB.getCantidadUsuariosByTestAndAntiguedad('users_tests',_id_test,37,60)
    cantidad37A60 = cantidad37A60.length == 1 ? cantidad37A60[0].cantidad : 0
    const porcentaje37A60 = cantidad37A60 * 100 / cantidadTotal

    let cantidad61A120 = await this.mongoDB.getCantidadUsuariosByTestAndAntiguedad('users_tests',_id_test,61,120)
    cantidad61A120 = cantidad61A120.length == 1 ? cantidad61A120[0].cantidad : 0
    const porcentaje61A120 = cantidad61A120 * 100 / cantidadTotal

    let cantidad121 = await this.mongoDB.getCantidadUsuariosByTestAndAntiguedad('users_tests',_id_test,121)
    cantidad121 = cantidad121.length == 1 ? cantidad121[0].cantidad : 0
    const porcentaje121 = cantidad121 * 100 / cantidadTotal

    return [{
                name: 'De 1 a 6 meses',
                y: Math.round(porcentaje1A6 * 100) / 100,
                color: '#4472c4'
            }, {
                name: 'De 7 a 18 meses',
                y: Math.round(porcentaje7A18 * 100) / 100,
                color: '#ed7d31'
            }, {
                name: 'De 19 a 36 meses',
                y: Math.round(porcentaje19A36 * 100) / 100,
                color: '#a5a5a5'
            }, {
                name: 'De 37 a 60 meses',
                y: Math.round(porcentaje37A60 * 100) / 100,
                color: '#ffc000'
            }, {
                name: 'De 61 a 120 meses',
                y: Math.round(porcentaje61A120 * 100) / 100,
                color: '#5b9bd5'
            }, {
                name: 'De 121 en adelante',
                y: Math.round(porcentaje121 * 100) / 100,
                color: '#70ad47'
            }]

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

  async getDataPromedioPorAreas(_id_test,semaforo,cla=true,dimension=null) {
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
      const promedioArea = await this.getPromedioGeneral(_id_test,semaforo,ids_users,cla,dimension)
      areas[index] = {name:element.nombre,y:promedioArea.porcentaje,color:promedioArea.color}
    }

    areas.sort( this.compare )

    const response = {data: areas,menor:areas[0],mayor:areas[areas.length-1]}

    return response

  }

  async getDataPromedioPorGenero(_id_test,semaforo,cla=true,dimension=null) {
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
    const promedioMasculino = await this.getPromedioGeneral(_id_test,semaforo,ids_users,cla,dimension)
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
    const promedioFemenino = await this.getPromedioGeneral(_id_test,semaforo,ids_users,cla,dimension)
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

      const promedioAntiguedad = ids_users.length == 0 ? {porcentaje:0,color:"#ffffff"} : await this.getPromedioGeneral(_id_test,semaforo,ids_users,cla,dimension)
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

  async getPromedioGeneral(_id_test,semaforo,ids_users=[],cla=true,dimension=null) {
    /*let maximoSi = await this.mongoDB.maximoPreguntasClima('respuestas',_id_test,'si',cla,ids_users)
    maximoSi = maximoSi.length == 1 ? maximoSi[0].maxVal : 0
    let maximoNo = await this.mongoDB.maximoPreguntasClima('respuestas',_id_test,'no',cla,ids_users)
    maximoNo = maximoNo.length == 1 ? maximoNo[0].maxVal : 0
    let maximoOtro = await this.mongoDB.maximoPreguntasClima('respuestas',_id_test,'otro',cla,ids_users)
    maximoOtro = maximoOtro.length == 1 ? maximoOtro[0].maxVal : 0
    const arrayMaximos = [maximoSi,maximoNo,maximoOtro]
    const valorMaximo = Math.max.apply(null, arrayMaximos);*/
    const valorMaximo = 2
    let cantidadRespuestasCla = await this.mongoDB.cantidadRespuestasClima('respuestas',_id_test,cla,ids_users,dimension)
    cantidadRespuestasCla = cantidadRespuestasCla.length == 1 ? cantidadRespuestasCla[0].sumaTotal : 0
    const puntajeExitoso = valorMaximo * cantidadRespuestasCla
    
    let puntajeRespuestasObtenidasSi = await this.mongoDB.cantidadRespuestasObtenidasClima('respuestas',_id_test,'si',cla,ids_users,dimension)
    puntajeRespuestasObtenidasSi = puntajeRespuestasObtenidasSi.length == 1 ? puntajeRespuestasObtenidasSi[0].sumaTotal : 0
    let puntajeRespuestasObtenidasNo = await this.mongoDB.cantidadRespuestasObtenidasClima('respuestas',_id_test,'no',cla,ids_users,dimension)
    puntajeRespuestasObtenidasNo = puntajeRespuestasObtenidasNo.length == 1 ? puntajeRespuestasObtenidasNo[0].sumaTotal : 0
    let puntajeRespuestasObtenidasOtro = await this.mongoDB.cantidadRespuestasObtenidasClima('respuestas',_id_test,'otro',cla,ids_users,dimension)
    puntajeRespuestasObtenidasOtro = puntajeRespuestasObtenidasOtro.length == 1 ? puntajeRespuestasObtenidasOtro[0].sumaTotal : 0

    const puntajeObtenido = puntajeRespuestasObtenidasSi + puntajeRespuestasObtenidasNo + puntajeRespuestasObtenidasOtro

    let porcentajeGeneral = puntajeObtenido * 100 / puntajeExitoso

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

  getOptionsPerfilMotivacional(data,title,num) {
    const categories = ['Afiliación', 'Exploración', 'Logro', 'Poder'];
    return {
        type: "svg",
        outfile: `public/graficos/diagnostico/dataPerfilMotivacional${num}.svg`,
        options: {
            chart: {
                polar: true,
                type: 'line'
            },
            
            title: {
                text: title,
                style: {
                    fontSize: '14px' 
                },
                x: -25
            },
            credits: {
                enabled: false
            },
            xAxis: {
                categories: categories,
                tickmarkPlacement: 'on',
                lineWidth: 0
            },

            yAxis: {
                gridLineInterpolation: 'polygon',
                min: 0,
                max: 100,
                tickInterval: 20
            },

            series: [{
                name: "Puntaje final /100%",
                data: data ,
                pointPlacement: 'on'
            }],
            
            legend: {
                align: 'right',
                verticalAlign: 'middle',
                layout: 'vertical'
            }
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

  processGenerateBase64ChartPromiseAllIndividual(items) {
    const that = this
    
    return Promise.all(
      items.map(async (item) => {
        let num = 0;
        return Promise.all(
            item.usuarios.map(async (usuario) => {
                num++
                return Promise.all([
                    that.generateBase64Chart(that.getOptionsPerfilMotivacional(usuario.perfil_motivacional.data,
                        usuario.perfil_motivacional.title,item.area+"_usuario_"+num)),
                    that.generateBase64Chart(that.getOptionsFactoresHigienicos(usuario.factores_higienicos.data,
                        usuario.factores_higienicos.title,item.area+"_usuario_"+num)),
                        that.generateBase64Chart(that.getOptionsFactoresMotivacionales(usuario.factores_motivacionales.data,
                            usuario.factores_motivacionales.title,item.area+"_usuario_"+num))
                ]).then(datos => {
                    return {
                        dataPerfilMotivacional:datos[0],
                        dataFactoresHigienicos:datos[1],
                        dataFactoresMotivacionales:datos[2]
                    }

                }).catch(err => {
                    console.log("ERROR en processGenerateBase64ChartPromiseAllIndividual: ")
                })
            })
        ).then(values => {
            return {area: item.area,data:values}
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


  async generatePdfClima (data,res,host) {
    const ejs = require("ejs");
    const pdf = require("html-pdf");
    const path = require("path");

    let test = await this.mongoDB.get('tests',data._id_test)
    const _id_empresa = test._id_empresa
    const empresa = await this.mongoDB.get('empresas',_id_empresa)
    data.filepath = empresa.filepath
    
    const datosPorGruposGenero = {
      type: "svg",
      outfile: "public/graficos/clima/datosPorGruposGenero.svg",
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
            data: data.datos_por_grupos.genero
        }]
      }
    }

    const datosPorGruposAntiguedad = {
        type: "svg",
        outfile: "public/graficos/clima/datosPorGruposAntiguedad.svg",
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
            data: data.datos_por_grupos.antiguedad
        }]
      }
    }

    const datosPorGruposAreas = {
        type: "svg",
        outfile: "public/graficos/clima/datosPorGruposAreas.svg",
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
            data: data.datos_por_grupos.areas,
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
        outfile: "public/graficos/clima/datosTotalGeneralAreas.svg",
        
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
            data: data.total_general.areas,
            dataLabels: {
                enabled: true,
                color: '#000000',
                align: 'center',
                
            }
        }]
      }
    }

    const datosTotalGeneralGeneros = {
      type: "png",
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
            data: data.total_general.generos,
            dataLabels: {
                enabled: true,
                color: '#000000',
                align: 'center',
                
            }
        }]
      }
    }

    const datosTotalGeneralAntiguedades = {
      type: "png",
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
            data: data.total_general.antiguedades,
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
      this.generateBase64Chart(datosPorGruposAntiguedad),
      this.generateBase64Chart(datosPorGruposAreas),
      this.generateBase64Chart(datosTotalGeneralAreas),
      this.generateBase64Chart(datosTotalGeneralGeneros),
      this.generateBase64Chart(datosTotalGeneralAntiguedades),
      this.processGenerateBase64ChartAll(data.resumen_por_dimension[0],"1"),
      this.processGenerateBase64ChartAll(data.resumen_por_dimension[1],"2"),
      this.processGenerateBase64ChartAll(data.resumen_por_dimension[2],"3"),
      this.processGenerateBase64ChartAll(data.resumen_por_dimension[3],"4"),
      this.processGenerateBase64ChartAll(data.resumen_por_dimension[4],"5"),
      this.processGenerateBase64ChartAll(data.resumen_por_dimension[5],"6"),
      this.processGenerateBase64ChartAll(data.resumen_por_dimension[6],"7"),
      this.processGenerateBase64ChartAll(data.resumen_por_dimension[7],"8"),
    ]).then(values => {
      //let dat = await that.processGenerateBase64ChartAll(data.resumen_por_dimension)
      //console.dir(dat)
      chartExporter.killPool();
      data = Object.assign(data,{
        datosPorGruposGenero:values[0],
        datosPorGruposAntiguedad:values[1],
        datosPorGruposAreas:values[2],
        datosTotalGeneralAreas:values[3],
        datosTotalGeneralGeneros:values[4],
        datosTotalGeneralAntiguedades:values[5],

        dataResumenDimension1:values[6],
        dataResumenDimension2:values[7],
        dataResumenDimension3:values[8],
        dataResumenDimension4:values[9],
        dataResumenDimension5:values[10],
        dataResumenDimension6:values[11],
        dataResumenDimension7:values[12],
        dataResumenDimension8:values[13],
        host:host
      })
      ejs.renderFile(path.join(__dirname, '/../views/', "reporte_clima.ejs"), data, (err, html) => {
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
            const filename = "reporte_clima_"+data._id_test+".pdf"
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
                        message: "PDF link Clima Laboral."
                    });
                    
                }
            })
        }
      })
    }).catch(err => console.log("ERROR en generatePdfClima: "+err.message))


    
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

  async getDataIndividualArea(_id_test,semaforo_higienico,semaforo_motivacional) {
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
      const usuariosPorArea = await this.mongoDB.getAll('users_tests',{_id_test,_id_departamento,_id_empresa,delete:false},{_id_usuario:1})
      for (let index2 = 0; index2 < usuariosPorArea.length; index2++) {
        const elementUser = usuariosPorArea[index2]
        const _id_user = [elementUser._id_usuario]
        const user = await this.mongoDB.get('users',_id_user[0]);
        const afiliacion = await this.getDataPerfilMotivacional(_id_test,"1","Afiliación",_id_user)
        const exploracion = await this.getDataPerfilMotivacional(_id_test,"1","Exploración",_id_user)
        const logro = await this.getDataPerfilMotivacional(_id_test,"1","Logro",_id_user)
        const poder = await this.getDataPerfilMotivacional(_id_test,"1","Poder",_id_user)
        
        const usuario = { 
            perfil_motivacional: {
                title: `Perfil Motivacional: ${user.nombre} ${user.apellido}`,
                data: [afiliacion,exploracion,logro,poder]
            },
            factores_higienicos: {
                title: `Factores Higiénicos: ${user.nombre} ${user.apellido}`,
                data: await this.getDataFactoresHigienicos(_id_test,"2",semaforo_higienico,_id_user)
            },
            factores_motivacionales: {
                title: `Factores Motivacionales: ${user.nombre} ${user.apellido}`,
                data: await this.getDataFactoresMotivacionales(_id_test,"3",semaforo_motivacional,_id_user)
            }
        }
        
        if (parseFloat(afiliacion) > 0 || parseFloat(exploracion) > 0 || parseFloat(logro) > 0 || parseFloat(poder) > 0 ) {
            result.usuarios.push(usuario)
        }
      }

      if (result.usuarios.length > 0)
        respuesta.push(result)
      
    }
    return respuesta

  }
  






}

module.exports = ReportesService;
