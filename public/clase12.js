/* Clase 12 — Agentes de código, primer contacto
   Siete piezas: lo que trajo de la clase 11, una sesión de un agente de
   código paso a paso, el armador del pedido, el probador de expresiones y
   nodos Code, el revisor de JSON de workflows, el archivo de instrucciones
   y la actividad.

   Nada de lo que se dibuja acá lee colores desde JavaScript: todo sale de las
   variables de estilo.css, así que el cambio de tema lo resuelve el CSS solo.
   Ninguna pieza depende de un modelo ni de un proveedor: lo que se pega en el
   probador y en el revisor corre en este navegador y no sale de la página. */

exigirSesion();
document.getElementById('salir').addEventListener('click', e => { e.preventDefault(); cerrarSesion(); });

const reducido = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function leerGuardado(clave) {
  try { return (localStorage.getItem(clave) || '').trim(); } catch (e) { return ''; }
}
function escapar(t) {
  return String(t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
function copiar(texto, boton) {
  const original = boton.textContent;
  const listo = ok => { boton.textContent = ok ? 'Copiado' : 'Seleccioná y copiá a mano'; setTimeout(() => { boton.textContent = original; }, 1800); };
  if (navigator.clipboard && window.isSecureContext) {
    navigator.clipboard.writeText(texto).then(() => listo(true), () => listo(false));
  } else {
    listo(false);
  }
}

// Los seis casos del número de factura son los mismos que trae el workflow
// de la clase: salen del mismo archivo al armar el sitio.
const CASOS = [{"entrada": "A-0007-00004410", "esperado": "7-4410"}, {"entrada": "0001-00012345", "esperado": "1-12345"}, {"entrada": "B-0010-00000420", "esperado": "10-420"}, {"entrada": "Nº 0001-00012345", "esperado": "1-12345"}, {"entrada": "A 0001 00012345", "esperado": "1-12345"}, {"entrada": "sin número", "esperado": ""}];

// Tipos de nodo y versiones del paquete estable de n8n (2.43.5), sacados
// de los nodes.json de n8n-nodes-base y @n8n/n8n-nodes-langchain. Los nodos
// que se pueden usar como herramienta suman la variante <tipo>Tool, y los que
// tienen «send and wait», la variante <tipo>HitlTool.
const TIPOS = {"n8n-nodes-base.actionNetwork":[1],"n8n-nodes-base.activeCampaign":[1],"n8n-nodes-base.activeCampaignTrigger":[1],"n8n-nodes-base.acuitySchedulingTrigger":[1],"n8n-nodes-base.adalo":[1],"n8n-nodes-base.affinity":[1],"n8n-nodes-base.affinityTrigger":[1],"n8n-nodes-base.agileCrm":[1],"n8n-nodes-base.airtable":[1,2,2.1,2.2],"n8n-nodes-base.airtableTrigger":[1],"n8n-nodes-base.airtop":[1,1.1],"n8n-nodes-base.aiTransform":[1],"n8n-nodes-base.amqp":[1],"n8n-nodes-base.amqpTrigger":[1],"n8n-nodes-base.apiTemplateIo":[1],"n8n-nodes-base.asana":[1],"n8n-nodes-base.asanaTrigger":[1],"n8n-nodes-base.autopilot":[1],"n8n-nodes-base.autopilotTrigger":[1],"n8n-nodes-base.awsLambda":[1],"n8n-nodes-base.awsSns":[1],"n8n-nodes-base.awsSnsTrigger":[1],"n8n-nodes-base.awsCertificateManager":[1],"n8n-nodes-base.awsCognito":[1],"n8n-nodes-base.awsComprehend":[1],"n8n-nodes-base.awsDynamoDb":[1],"n8n-nodes-base.awsElb":[1],"n8n-nodes-base.awsIam":[1],"n8n-nodes-base.awsRekognition":[1],"n8n-nodes-base.awsS3":[1,2],"n8n-nodes-base.awsSes":[1],"n8n-nodes-base.awsSqs":[1],"n8n-nodes-base.awsTextract":[1],"n8n-nodes-base.awsTranscribe":[1],"n8n-nodes-base.bambooHr":[1],"n8n-nodes-base.bannerbear":[1],"n8n-nodes-base.baserow":[1,1.1],"n8n-nodes-base.beeminder":[1],"n8n-nodes-base.bitbucketTrigger":[1,1.1],"n8n-nodes-base.bitly":[1],"n8n-nodes-base.bitwarden":[1],"n8n-nodes-base.box":[1],"n8n-nodes-base.boxTrigger":[1],"n8n-nodes-base.Brandfetch":[1,2],"n8n-nodes-base.bubble":[1],"n8n-nodes-base.calTrigger":[1,2,3],"n8n-nodes-base.calendlyTrigger":[1,2],"n8n-nodes-base.chargebee":[1],"n8n-nodes-base.chargebeeTrigger":[1],"n8n-nodes-base.circleCi":[1],"n8n-nodes-base.ciscoWebex":[1],"n8n-nodes-base.ciscoWebexTrigger":[1],"n8n-nodes-base.cloudflare":[1],"n8n-nodes-base.clearbit":[1],"n8n-nodes-base.clickUp":[1],"n8n-nodes-base.clickUpTrigger":[1],"n8n-nodes-base.clockify":[1],"n8n-nodes-base.clockifyTrigger":[1],"n8n-nodes-base.cockpit":[1],"n8n-nodes-base.coda":[1,1.1],"n8n-nodes-base.code":[1,2],"n8n-nodes-base.coinGecko":[1],"n8n-nodes-base.compareDatasets":[1,2,2.1,2.2,2.3],"n8n-nodes-base.compression":[1,1.1],"n8n-nodes-base.confluence":[1],"n8n-nodes-base.contentful":[1],"n8n-nodes-base.convertKit":[1],"n8n-nodes-base.convertKitTrigger":[1],"n8n-nodes-base.copper":[1],"n8n-nodes-base.copperTrigger":[1],"n8n-nodes-base.cortex":[1],"n8n-nodes-base.crateDb":[1,1.1],"n8n-nodes-base.dynamicCredentialCheck":[1],"n8n-nodes-base.cron":[1],"n8n-nodes-base.crypto":[1,2],"n8n-nodes-base.currents":[1],"n8n-nodes-base.currentsTrigger":[1],"n8n-nodes-base.customerIo":[1],"n8n-nodes-base.customerIoTrigger":[1],"n8n-nodes-base.databricks":[1],"n8n-nodes-base.databricksTrigger":[1],"n8n-nodes-base.dataTable":[1,1.1],"n8n-nodes-base.dateTime":[1,2],"n8n-nodes-base.debugHelper":[1],"n8n-nodes-base.deepL":[1],"n8n-nodes-base.demio":[1],"n8n-nodes-base.dhl":[1],"n8n-nodes-base.discord":[1,2],"n8n-nodes-base.discourse":[1],"n8n-nodes-base.disqus":[1],"n8n-nodes-base.drift":[1],"n8n-nodes-base.dropbox":[1],"n8n-nodes-base.dropcontact":[1],"n8n-nodes-base.editImage":[1,1.1],"n8n-nodes-base.e2eTest":[1],"n8n-nodes-base.e2eTestPollingTrigger":[1],"n8n-nodes-base.egoi":[1],"n8n-nodes-base.elasticsearch":[1],"n8n-nodes-base.elasticSecurity":[1],"n8n-nodes-base.emailReadImap":[1,2,2.1,2.2],"n8n-nodes-base.emailSend":[1,2,2.1],"n8n-nodes-base.emelia":[1],"n8n-nodes-base.emeliaTrigger":[1],"n8n-nodes-base.erpNext":[1],"n8n-nodes-base.errorTrigger":[1],"n8n-nodes-base.evaluationTrigger":[4.6,4.7],"n8n-nodes-base.evaluation":[4.6,4.7,4.8],"n8n-nodes-base.eventbriteTrigger":[1],"n8n-nodes-base.executeCommand":[1],"n8n-nodes-base.executeWorkflow":[1,1.1,1.2,1.3,1.4],"n8n-nodes-base.executeWorkflowTrigger":[1,1.1,1.2,1.3],"n8n-nodes-base.executionData":[1,1.1],"n8n-nodes-base.facebookGraphApi":[1],"n8n-nodes-base.facebookTrigger":[1],"n8n-nodes-base.facebookLeadAdsTrigger":[1],"n8n-nodes-base.figmaTrigger":[1],"n8n-nodes-base.filemaker":[1],"n8n-nodes-base.readWriteFile":[1,1.1],"n8n-nodes-base.convertToFile":[1,1.1],"n8n-nodes-base.extractFromFile":[1,1.1],"n8n-nodes-base.filter":[1,2,2.1,2.2,2.3],"n8n-nodes-base.flow":[1],"n8n-nodes-base.flowTrigger":[1],"n8n-nodes-base.form":[1,2.3,2.4,2.5],"n8n-nodes-base.formTrigger":[1,2,2.1,2.2,2.3,2.4,2.5,2.6],"n8n-nodes-base.formIoTrigger":[1],"n8n-nodes-base.formstackTrigger":[1],"n8n-nodes-base.freshdesk":[1],"n8n-nodes-base.freshservice":[1],"n8n-nodes-base.freshworksCrm":[1],"n8n-nodes-base.ftp":[1,1.1],"n8n-nodes-base.function":[1],"n8n-nodes-base.functionItem":[1],"n8n-nodes-base.getResponse":[1],"n8n-nodes-base.getResponseTrigger":[1],"n8n-nodes-base.ghost":[1],"n8n-nodes-base.git":[1,1.1],"n8n-nodes-base.github":[1,1.1],"n8n-nodes-base.githubTrigger":[1],"n8n-nodes-base.gitlab":[1],"n8n-nodes-base.gitlabTrigger":[1],"n8n-nodes-base.gong":[1],"n8n-nodes-base.googleAds":[1],"n8n-nodes-base.googleAnalytics":[1,2],"n8n-nodes-base.googleBigQuery":[1,2,2.1],"n8n-nodes-base.googleBooks":[1,2],"n8n-nodes-base.googleCalendar":[1,1.1,1.2,1.3],"n8n-nodes-base.googleCalendarTrigger":[1],"n8n-nodes-base.googleChat":[1],"n8n-nodes-base.googleCloudNaturalLanguage":[1],"n8n-nodes-base.googleCloudStorage":[1,1.1],"n8n-nodes-base.googleContacts":[1],"n8n-nodes-base.googleDocs":[1,2],"n8n-nodes-base.googleDrive":[1,2,3],"n8n-nodes-base.googleDriveTrigger":[1],"n8n-nodes-base.googleFirebaseCloudFirestore":[1,1.1],"n8n-nodes-base.googleFirebaseRealtimeDatabase":[1],"n8n-nodes-base.gmail":[1,2,2.1,2.2],"n8n-nodes-base.gmailTrigger":[1,1.1,1.2,1.3,1.4],"n8n-nodes-base.gSuiteAdmin":[1],"n8n-nodes-base.googleBusinessProfile":[1],"n8n-nodes-base.googleBusinessProfileTrigger":[1],"n8n-nodes-base.googlePerspective":[1],"n8n-nodes-base.googleSheets":[1,2,3,4,4.1,4.2,4.3,4.4,4.5,4.6,4.7],"n8n-nodes-base.googleSheetsTrigger":[1],"n8n-nodes-base.googleSlides":[1,2],"n8n-nodes-base.googleTasks":[1],"n8n-nodes-base.googleTranslate":[1,2],"n8n-nodes-base.youTube":[1],"n8n-nodes-base.gotify":[1],"n8n-nodes-base.goToWebinar":[1],"n8n-nodes-base.grafana":[1],"n8n-nodes-base.graphql":[1,1.1],"n8n-nodes-base.grist":[1],"n8n-nodes-base.gumroadTrigger":[1],"n8n-nodes-base.hackerNews":[1],"n8n-nodes-base.haloPSA":[1],"n8n-nodes-base.harvest":[1],"n8n-nodes-base.helpScout":[1],"n8n-nodes-base.helpScoutTrigger":[1],"n8n-nodes-base.highLevel":[1,2],"n8n-nodes-base.homeAssistant":[1],"n8n-nodes-base.htmlExtract":[1],"n8n-nodes-base.html":[1,1.1,1.2],"n8n-nodes-base.httpRequest":[1,2,3,4,4.1,4.2,4.3,4.4,4.5],"n8n-nodes-base.hubspot":[1,2,2.1,2.2],"n8n-nodes-base.hubspotTrigger":[1],"n8n-nodes-base.humanticAi":[1],"n8n-nodes-base.hunter":[1],"n8n-nodes-base.iCal":[1],"n8n-nodes-base.if":[1,2,2.1,2.2,2.3],"n8n-nodes-base.intercom":[1],"n8n-nodes-base.interval":[1],"n8n-nodes-base.invoiceNinja":[1,2],"n8n-nodes-base.invoiceNinjaTrigger":[1,2],"n8n-nodes-base.itemLists":[1,2,2.1,2.2,3,3.1],"n8n-nodes-base.iterable":[1],"n8n-nodes-base.jenkins":[1],"n8n-nodes-base.jinaAi":[1],"n8n-nodes-base.jira":[1],"n8n-nodes-base.jiraTrigger":[1,1.1],"n8n-nodes-base.jotFormTrigger":[1],"n8n-nodes-base.jwt":[1],"n8n-nodes-base.kafka":[1,2],"n8n-nodes-base.kafkaTrigger":[1,1.1,1.2,1.3,2],"n8n-nodes-base.keap":[1],"n8n-nodes-base.keapTrigger":[1],"n8n-nodes-base.koBoToolbox":[1],"n8n-nodes-base.koBoToolboxTrigger":[1],"n8n-nodes-base.ldap":[1],"n8n-nodes-base.lemlist":[1,2],"n8n-nodes-base.lemlistTrigger":[1],"n8n-nodes-base.line":[1],"n8n-nodes-base.linear":[1,1.1],"n8n-nodes-base.linearTrigger":[1],"n8n-nodes-base.lingvaNex":[1],"n8n-nodes-base.linkedIn":[1],"n8n-nodes-base.localFileTrigger":[1],"n8n-nodes-base.loneScaleTrigger":[1],"n8n-nodes-base.loneScale":[1],"n8n-nodes-base.magento2":[1],"n8n-nodes-base.mailcheck":[1],"n8n-nodes-base.mailchimp":[1],"n8n-nodes-base.mailchimpTrigger":[1],"n8n-nodes-base.mailerLite":[1,2],"n8n-nodes-base.mailerLiteTrigger":[1,2],"n8n-nodes-base.mailgun":[1],"n8n-nodes-base.mailjet":[1],"n8n-nodes-base.mailjetTrigger":[1],"n8n-nodes-base.mandrill":[1],"n8n-nodes-base.manualTrigger":[1],"n8n-nodes-base.markdown":[1],"n8n-nodes-base.marketstack":[1],"n8n-nodes-base.matrix":[1],"n8n-nodes-base.mattermost":[1],"n8n-nodes-base.mautic":[1],"n8n-nodes-base.mauticTrigger":[1],"n8n-nodes-base.medium":[1],"n8n-nodes-base.merge":[1,2,2.1,3,3.1,3.2],"n8n-nodes-base.messageAnAgent":[1,2,3,3.1],"n8n-nodes-base.messageBird":[1],"n8n-nodes-base.metabase":[1],"n8n-nodes-base.azureCosmosDb":[1],"n8n-nodes-base.microsoftDataverse":[1],"n8n-nodes-base.microsoftDynamicsCrm":[1],"n8n-nodes-base.microsoftEntra":[1],"n8n-nodes-base.microsoftExcel":[1,2,2.1,2.2],"n8n-nodes-base.microsoftExcelSharePoint":[1],"n8n-nodes-base.microsoftGraphSecurity":[1],"n8n-nodes-base.microsoftOneDrive":[1,1.1],"n8n-nodes-base.microsoftOneDriveTrigger":[1],"n8n-nodes-base.microsoftOutlook":[1,2],"n8n-nodes-base.microsoftOutlookTrigger":[1],"n8n-nodes-base.microsoftSharePoint":[1,2],"n8n-nodes-base.microsoftSharePointTrigger":[1],"n8n-nodes-base.microsoftSql":[1,1.1,1.2],"n8n-nodes-base.azureStorage":[1],"n8n-nodes-base.microsoftTeams":[1,1.1,2],"n8n-nodes-base.microsoftTeamsTrigger":[1],"n8n-nodes-base.microsoftToDo":[1],"n8n-nodes-base.mindee":[1,2,3],"n8n-nodes-base.misp":[1],"n8n-nodes-base.mistralAi":[1],"n8n-nodes-base.mocean":[1],"n8n-nodes-base.mondayCom":[1],"n8n-nodes-base.mongoDb":[1,1.1,1.2,1.3,1.4,1.5],"n8n-nodes-base.monicaCrm":[1],"n8n-nodes-base.moveBinaryData":[1,1.1],"n8n-nodes-base.mqtt":[1],"n8n-nodes-base.mqttTrigger":[1],"n8n-nodes-base.msg91":[1],"n8n-nodes-base.mySql":[1,2,2.1,2.2,2.3,2.4,2.5],"n8n-nodes-base.n8n":[1],"n8n-nodes-base.n8nTrainingCustomerDatastore":[1],"n8n-nodes-base.n8nTrainingCustomerMessenger":[1],"n8n-nodes-base.n8nTrigger":[1],"n8n-nodes-base.nasa":[1],"n8n-nodes-base.netlify":[1],"n8n-nodes-base.netlifyTrigger":[1],"n8n-nodes-base.nextCloud":[1],"n8n-nodes-base.nocoDb":[1,2,3,4],"n8n-nodes-base.sendInBlue":[1,1.1],"n8n-nodes-base.sendInBlueTrigger":[1],"n8n-nodes-base.stickyNote":[1],"n8n-nodes-base.noOp":[1],"n8n-nodes-base.onfleet":[1],"n8n-nodes-base.onfleetTrigger":[1],"n8n-nodes-base.citrixAdc":[1],"n8n-nodes-base.notion":[1,2,2.1,2.2,3],"n8n-nodes-base.notionTrigger":[1,1.1],"n8n-nodes-base.npm":[1],"n8n-nodes-base.odoo":[1,2],"n8n-nodes-base.okta":[1],"n8n-nodes-base.oneSimpleApi":[1],"n8n-nodes-base.openAi":[1,1.1],"n8n-nodes-base.openThesaurus":[1],"n8n-nodes-base.openWeatherMap":[1],"n8n-nodes-base.oracleDatabase":[1,1.1],"n8n-nodes-base.orbit":[1],"n8n-nodes-base.oura":[1],"n8n-nodes-base.paddle":[1],"n8n-nodes-base.pagerDuty":[1],"n8n-nodes-base.payPal":[1],"n8n-nodes-base.payPalTrigger":[1],"n8n-nodes-base.peekalink":[1],"n8n-nodes-base.perplexity":[1,2,3],"n8n-nodes-base.phantombuster":[1],"n8n-nodes-base.philipsHue":[1],"n8n-nodes-base.pipedrive":[1,2],"n8n-nodes-base.pipedriveTrigger":[1,1.1],"n8n-nodes-base.plivo":[1],"n8n-nodes-base.postBin":[1],"n8n-nodes-base.postgres":[1,2,2.1,2.2,2.3,2.4,2.5,2.6,2.7],"n8n-nodes-base.postgresTrigger":[1],"n8n-nodes-base.postHog":[1],"n8n-nodes-base.postmarkTrigger":[1],"n8n-nodes-base.profitWell":[1],"n8n-nodes-base.pushbullet":[1],"n8n-nodes-base.pushcut":[1],"n8n-nodes-base.pushcutTrigger":[1],"n8n-nodes-base.pushover":[1],"n8n-nodes-base.questDb":[1,1.1],"n8n-nodes-base.quickbase":[1],"n8n-nodes-base.quickbooks":[1],"n8n-nodes-base.quickChart":[1],"n8n-nodes-base.rabbitmq":[1,1.1,1.2],"n8n-nodes-base.rabbitmqTrigger":[1],"n8n-nodes-base.raindrop":[1],"n8n-nodes-base.readBinaryFile":[1],"n8n-nodes-base.readBinaryFiles":[1],"n8n-nodes-base.readPDF":[1],"n8n-nodes-base.reddit":[1],"n8n-nodes-base.redis":[1],"n8n-nodes-base.redisTrigger":[1],"n8n-nodes-base.renameKeys":[1],"n8n-nodes-base.respondToWebhook":[1,1.1,1.2,1.3,1.4,1.5],"n8n-nodes-base.rocketchat":[1],"n8n-nodes-base.rssFeedRead":[1,1.1,1.2],"n8n-nodes-base.rssFeedReadTrigger":[1],"n8n-nodes-base.rundeck":[1,1.1],"n8n-nodes-base.s3":[1],"n8n-nodes-base.salesforce":[1,1.1],"n8n-nodes-base.salesforceTrigger":[1,1.1],"n8n-nodes-base.salesmate":[1],"n8n-nodes-base.scheduleTrigger":[1,1.1,1.2,1.3,1.4],"n8n-nodes-base.seaTable":[1,2],"n8n-nodes-base.seaTableTrigger":[1,2],"n8n-nodes-base.securityScorecard":[1],"n8n-nodes-base.segment":[1],"n8n-nodes-base.sendGrid":[1],"n8n-nodes-base.sendy":[1],"n8n-nodes-base.sentryIo":[1],"n8n-nodes-base.serviceNow":[1],"n8n-nodes-base.set":[1,2,3,3.1,3.2,3.3,3.4,3.5],"n8n-nodes-base.shopify":[1],"n8n-nodes-base.shopifyTrigger":[1],"n8n-nodes-base.signl4":[1],"n8n-nodes-base.simulate":[1],"n8n-nodes-base.simulateTrigger":[1],"n8n-nodes-base.slack":[1,2,2.1,2.2,2.3,2.4,2.5,2.6,2.7],"n8n-nodes-base.slackTrigger":[1],"n8n-nodes-base.sms77":[1],"n8n-nodes-base.snowflake":[1,1.1],"n8n-nodes-base.splitInBatches":[1,2,3],"n8n-nodes-base.splunk":[1,2],"n8n-nodes-base.spotify":[1],"n8n-nodes-base.spreadsheetFile":[1,2],"n8n-nodes-base.sseTrigger":[1],"n8n-nodes-base.ssh":[1],"n8n-nodes-base.stackby":[1],"n8n-nodes-base.stopAndError":[1],"n8n-nodes-base.storyblok":[1],"n8n-nodes-base.strapi":[1],"n8n-nodes-base.strava":[1,1.1],"n8n-nodes-base.stravaTrigger":[1],"n8n-nodes-base.stripe":[1],"n8n-nodes-base.stripeTrigger":[1],"n8n-nodes-base.supabase":[1],"n8n-nodes-base.surveyMonkeyTrigger":[1],"n8n-nodes-base.switch":[1,2,3,3.1,3.2,3.3,3.4],"n8n-nodes-base.syncroMsp":[1],"n8n-nodes-base.taiga":[1],"n8n-nodes-base.taigaTrigger":[1],"n8n-nodes-base.tapfiliate":[1],"n8n-nodes-base.telegram":[1,1.1,1.2],"n8n-nodes-base.telegramTrigger":[1,1.1,1.2,1.3,1.4,1.5],"n8n-nodes-base.theHiveProject":[1],"n8n-nodes-base.theHiveProjectTrigger":[1],"n8n-nodes-base.theHive":[1],"n8n-nodes-base.theHiveTrigger":[1,2],"n8n-nodes-base.timescaleDb":[1,1.1],"n8n-nodes-base.todoist":[1,2,2.1,2.2],"n8n-nodes-base.togglTrigger":[1],"n8n-nodes-base.totp":[1],"n8n-nodes-base.travisCi":[1],"n8n-nodes-base.trello":[1],"n8n-nodes-base.trelloTrigger":[1],"n8n-nodes-base.timeSaved":[1],"n8n-nodes-base.twake":[1],"n8n-nodes-base.twilio":[1],"n8n-nodes-base.twilioTrigger":[1],"n8n-nodes-base.twist":[1],"n8n-nodes-base.twitter":[1,2],"n8n-nodes-base.typeformTrigger":[1,1.1],"n8n-nodes-base.unleashedSoftware":[1,1.1],"n8n-nodes-base.uplead":[1],"n8n-nodes-base.uproc":[1],"n8n-nodes-base.uptimeRobot":[1],"n8n-nodes-base.urlScanIo":[1],"n8n-nodes-base.vero":[1],"n8n-nodes-base.venafiTlsProtectCloud":[1],"n8n-nodes-base.venafiTlsProtectCloudTrigger":[1],"n8n-nodes-base.venafiTlsProtectDatacenter":[1],"n8n-nodes-base.vonage":[1],"n8n-nodes-base.wait":[1,1.1],"n8n-nodes-base.webflow":[1,2],"n8n-nodes-base.webflowTrigger":[1,2],"n8n-nodes-base.webhook":[1,1.1,2,2.1,2.2],"n8n-nodes-base.wekan":[1],"n8n-nodes-base.wise":[1],"n8n-nodes-base.wiseTrigger":[1],"n8n-nodes-base.wooCommerce":[1],"n8n-nodes-base.wooCommerceTrigger":[1],"n8n-nodes-base.wordpress":[1],"n8n-nodes-base.workableTrigger":[1],"n8n-nodes-base.workflowTrigger":[1],"n8n-nodes-base.writeBinaryFile":[1],"n8n-nodes-base.wufooTrigger":[1],"n8n-nodes-base.xero":[1],"n8n-nodes-base.xml":[1],"n8n-nodes-base.yourls":[1],"n8n-nodes-base.zammad":[1],"n8n-nodes-base.zendesk":[1],"n8n-nodes-base.zendeskTrigger":[1],"n8n-nodes-base.zohoCrm":[1],"n8n-nodes-base.zoom":[1],"n8n-nodes-base.zulip":[1],"n8n-nodes-base.aggregate":[1],"n8n-nodes-base.limit":[1],"n8n-nodes-base.removeDuplicates":[1,1.1,2],"n8n-nodes-base.splitOut":[1,1.1],"n8n-nodes-base.sort":[1],"n8n-nodes-base.summarize":[1,1.1],"@n8n/n8n-nodes-langchain.alibabaCloud":[1,1.1],"@n8n/n8n-nodes-langchain.anthropic":[1],"@n8n/n8n-nodes-langchain.googleGemini":[1,1.1,1.2],"@n8n/n8n-nodes-langchain.minimax":[1,1.1,1.2],"@n8n/n8n-nodes-langchain.moonshot":[1],"@n8n/n8n-nodes-langchain.ollama":[1],"@n8n/n8n-nodes-langchain.openAi":[1,1.1,1.2,1.3,1.4,1.5,1.6,1.7,1.8,2,2.1,2.2,2.3],"@n8n/n8n-nodes-langchain.microsoftAgent365Trigger":[1,1.1],"@n8n/n8n-nodes-langchain.agent":[1,1.1,1.2,1.3,1.4,1.5,1.6,1.7,1.8,1.9,2,2.1,2.2,3,3.1],"@n8n/n8n-nodes-langchain.agentTool":[2.2,3],"@n8n/n8n-nodes-langchain.openAiAssistant":[1,1.1],"@n8n/n8n-nodes-langchain.chainSummarization":[1,2,2.1],"@n8n/n8n-nodes-langchain.chainLlm":[1,1.1,1.2,1.3,1.4,1.5,1.6,1.7,1.8,1.9],"@n8n/n8n-nodes-langchain.chainRetrievalQa":[1,1.1,1.2,1.3,1.4,1.5,1.6,1.7],"@n8n/n8n-nodes-langchain.sentimentAnalysis":[1,1.1],"@n8n/n8n-nodes-langchain.informationExtractor":[1,1.1,1.2],"@n8n/n8n-nodes-langchain.textClassifier":[1,1.1],"@n8n/n8n-nodes-langchain.code":[1],"@n8n/n8n-nodes-langchain.documentDefaultDataLoader":[1,1.1],"@n8n/n8n-nodes-langchain.documentBinaryInputLoader":[1],"@n8n/n8n-nodes-langchain.documentGithubLoader":[1,1.1],"@n8n/n8n-nodes-langchain.documentJsonInputLoader":[1],"@n8n/n8n-nodes-langchain.embeddingsCohere":[1],"@n8n/n8n-nodes-langchain.embeddingsDatabricks":[1],"@n8n/n8n-nodes-langchain.embeddingsAwsBedrock":[1],"@n8n/n8n-nodes-langchain.embeddingsAzureOpenAi":[1],"@n8n/n8n-nodes-langchain.embeddingsGoogleGemini":[1],"@n8n/n8n-nodes-langchain.embeddingsGoogleVertex":[1],"@n8n/n8n-nodes-langchain.embeddingsHuggingFaceInference":[1],"@n8n/n8n-nodes-langchain.embeddingsMistralCloud":[1],"@n8n/n8n-nodes-langchain.embeddingsOpenAi":[1,1.1,1.2],"@n8n/n8n-nodes-langchain.embeddingsLemonade":[1],"@n8n/n8n-nodes-langchain.embeddingsOllama":[1],"@n8n/n8n-nodes-langchain.embeddingsOracleDb":[1],"@n8n/n8n-nodes-langchain.embeddingsNvidia":[1],"@n8n/n8n-nodes-langchain.lmChatAlibabaCloud":[1,1.1],"@n8n/n8n-nodes-langchain.lmChatAnthropic":[1,1.1,1.2,1.3,1.4,1.5,1.6],"@n8n/n8n-nodes-langchain.lmChatAzureOpenAi":[1,1.1],"@n8n/n8n-nodes-langchain.lmChatAwsBedrock":[1,1.1,1.2],"@n8n/n8n-nodes-langchain.lmChatCohere":[1],"@n8n/n8n-nodes-langchain.lmChatDatabricks":[1],"@n8n/n8n-nodes-langchain.lmChatDeepSeek":[1],"@n8n/n8n-nodes-langchain.lmChatGoogleGemini":[1,1.1,1.2],"@n8n/n8n-nodes-langchain.lmChatGoogleVertex":[1],"@n8n/n8n-nodes-langchain.lmChatGroq":[1],"@n8n/n8n-nodes-langchain.lmChatMistralCloud":[1],"@n8n/n8n-nodes-langchain.lmChatMinimax":[1,1.1,1.2],"@n8n/n8n-nodes-langchain.lmChatMoonshot":[1,1.1],"@n8n/n8n-nodes-langchain.lmChatLemonade":[1],"@n8n/n8n-nodes-langchain.lmChatNvidia":[1],"@n8n/n8n-nodes-langchain.lmChatOllama":[1],"@n8n/n8n-nodes-langchain.lmChatOpenRouter":[1],"@n8n/n8n-nodes-langchain.lmChatVercelAiGateway":[1],"@n8n/n8n-nodes-langchain.lmChatXAiGrok":[1],"@n8n/n8n-nodes-langchain.lmChatOpenAi":[1,1.1,1.2,1.3],"@n8n/n8n-nodes-langchain.lmOpenAi":[1],"@n8n/n8n-nodes-langchain.lmCohere":[1],"@n8n/n8n-nodes-langchain.lmLemonade":[1],"@n8n/n8n-nodes-langchain.lmOllama":[1],"@n8n/n8n-nodes-langchain.lmOpenHuggingFaceInference":[1],"@n8n/n8n-nodes-langchain.mcpClient":[1,1.1],"@n8n/n8n-nodes-langchain.mcpClientTool":[1,1.1,1.2,1.3,1.4],"@n8n/n8n-nodes-langchain.mcpRegistryClientTool":[1,1.1],"@n8n/n8n-nodes-langchain.mcpTrigger":[1,1.1,2,2.1],"@n8n/n8n-nodes-langchain.memoryBufferWindow":[1,1.1,1.2,1.3,1.4],"@n8n/n8n-nodes-langchain.memoryMotorhead":[1,1.1,1.2,1.3,1.4],"@n8n/n8n-nodes-langchain.memoryPostgresChat":[1,1.1,1.2,1.3,1.4],"@n8n/n8n-nodes-langchain.memoryMongoDbChat":[1,1.1],"@n8n/n8n-nodes-langchain.memoryRedisChat":[1,1.1,1.2,1.3,1.4,1.5,1.6],"@n8n/n8n-nodes-langchain.memoryManager":[1,1.1],"@n8n/n8n-nodes-langchain.memoryChatRetriever":[1],"@n8n/n8n-nodes-langchain.memoryXata":[1,1.1,1.2,1.3,1.4,1.5],"@n8n/n8n-nodes-langchain.memoryZep":[1,1.1,1.2,1.3,1.4],"@n8n/n8n-nodes-langchain.outputParserAutofixing":[1],"@n8n/n8n-nodes-langchain.outputParserItemList":[1],"@n8n/n8n-nodes-langchain.outputParserStructured":[1,1.1,1.2,1.3],"@n8n/n8n-nodes-langchain.rerankerCohere":[1],"@n8n/n8n-nodes-langchain.retrieverContextualCompression":[1],"@n8n/n8n-nodes-langchain.retrieverVectorStore":[1],"@n8n/n8n-nodes-langchain.retrieverMultiQuery":[1],"@n8n/n8n-nodes-langchain.retrieverWorkflow":[1,1.1],"@n8n/n8n-nodes-langchain.textSplitterCharacterTextSplitter":[1],"@n8n/n8n-nodes-langchain.textSplitterRecursiveCharacterTextSplitter":[1],"@n8n/n8n-nodes-langchain.textSplitterTokenSplitter":[1],"@n8n/n8n-nodes-langchain.toolCalculator":[1],"@n8n/n8n-nodes-langchain.toolCode":[1,1.1,1.2,1.3],"@n8n/n8n-nodes-langchain.toolHttpRequest":[1,1.1],"@n8n/n8n-nodes-langchain.toolSearXng":[1],"@n8n/n8n-nodes-langchain.toolSerpApi":[1],"@n8n/n8n-nodes-langchain.toolThink":[1,1.1],"@n8n/n8n-nodes-langchain.toolVectorStore":[1,1.1],"@n8n/n8n-nodes-langchain.toolWikipedia":[1],"@n8n/n8n-nodes-langchain.toolWolframAlpha":[1],"@n8n/n8n-nodes-langchain.toolWorkflow":[1,1.1,1.2,1.3,2,2.1,2.2],"@n8n/n8n-nodes-langchain.manualChatTrigger":[1,1.1],"@n8n/n8n-nodes-langchain.chatTrigger":[1,1.1,1.2,1.3,1.4,1.5],"@n8n/n8n-nodes-langchain.chat":[1,1.1,1.2,1.3],"@n8n/n8n-nodes-langchain.vectorStoreAzureAISearch":[1,1.1,1.2,1.3],"@n8n/n8n-nodes-langchain.vectorStoreDatabricks":[1,1.1,1.2,1.3],"@n8n/n8n-nodes-langchain.vectorStoreInMemory":[1,1.1,1.2,1.3],"@n8n/n8n-nodes-langchain.vectorStoreInMemoryInsert":[1],"@n8n/n8n-nodes-langchain.vectorStoreInMemoryLoad":[1],"@n8n/n8n-nodes-langchain.vectorStoreMilvus":[1,1.1,1.2,1.3],"@n8n/n8n-nodes-langchain.vectorStoreMongoDBAtlas":[1,1.1,1.2,1.3],"@n8n/n8n-nodes-langchain.vectorStoreOracleDBVector":[1,1.1,1.2,1.3],"@n8n/n8n-nodes-langchain.vectorStorePGVector":[1,1.1,1.2,1.3],"@n8n/n8n-nodes-langchain.chatHubVectorStorePGVector":[1,1.1,1.2,1.3],"@n8n/n8n-nodes-langchain.chatHubVectorStoreQdrant":[1,1.1,1.2,1.3],"@n8n/n8n-nodes-langchain.vectorStorePinecone":[1,1.1,1.2,1.3],"@n8n/n8n-nodes-langchain.chatHubVectorStorePinecone":[1,1.1,1.2,1.3],"@n8n/n8n-nodes-langchain.vectorStorePineconeInsert":[1],"@n8n/n8n-nodes-langchain.vectorStorePineconeLoad":[1],"@n8n/n8n-nodes-langchain.vectorStoreRedis":[1,1.1,1.2,1.3],"@n8n/n8n-nodes-langchain.vectorStoreQdrant":[1,1.1,1.2,1.3],"@n8n/n8n-nodes-langchain.vectorStoreSupabase":[1,1.1,1.2,1.3],"@n8n/n8n-nodes-langchain.vectorStoreSupabaseInsert":[1],"@n8n/n8n-nodes-langchain.vectorStoreSupabaseLoad":[1],"@n8n/n8n-nodes-langchain.vectorStoreWeaviate":[1,1.1,1.2,1.3],"@n8n/n8n-nodes-langchain.vectorStoreZep":[1,1.1,1.2,1.3],"@n8n/n8n-nodes-langchain.vectorStoreZepInsert":[1],"@n8n/n8n-nodes-langchain.vectorStoreZepLoad":[1],"@n8n/n8n-nodes-langchain.vectorStoreChromaDB":[1,1.1,1.2,1.3],"@n8n/n8n-nodes-langchain.toolExecutor":[1],"@n8n/n8n-nodes-langchain.modelSelector":[1],"@n8n/n8n-nodes-langchain.guardrails":[1,2]};
const COMO_HERRAMIENTA = ["@n8n/n8n-nodes-langchain.alibabaCloud","@n8n/n8n-nodes-langchain.anthropic","@n8n/n8n-nodes-langchain.chat","@n8n/n8n-nodes-langchain.googleGemini","@n8n/n8n-nodes-langchain.minimax","@n8n/n8n-nodes-langchain.moonshot","@n8n/n8n-nodes-langchain.ollama","n8n-nodes-base.Brandfetch","n8n-nodes-base.actionNetwork","n8n-nodes-base.activeCampaign","n8n-nodes-base.adalo","n8n-nodes-base.affinity","n8n-nodes-base.agileCrm","n8n-nodes-base.airtable","n8n-nodes-base.airtop","n8n-nodes-base.amqp","n8n-nodes-base.apiTemplateIo","n8n-nodes-base.asana","n8n-nodes-base.autopilot","n8n-nodes-base.awsLambda","n8n-nodes-base.awsS3","n8n-nodes-base.awsSes","n8n-nodes-base.awsSns","n8n-nodes-base.awsTextract","n8n-nodes-base.awsTranscribe","n8n-nodes-base.bambooHr","n8n-nodes-base.baserow","n8n-nodes-base.beeminder","n8n-nodes-base.bitly","n8n-nodes-base.bitwarden","n8n-nodes-base.bubble","n8n-nodes-base.chargebee","n8n-nodes-base.circleCi","n8n-nodes-base.ciscoWebex","n8n-nodes-base.clearbit","n8n-nodes-base.clickUp","n8n-nodes-base.clockify","n8n-nodes-base.cloudflare","n8n-nodes-base.cockpit","n8n-nodes-base.coda","n8n-nodes-base.coinGecko","n8n-nodes-base.compression","n8n-nodes-base.confluence","n8n-nodes-base.contentful","n8n-nodes-base.convertKit","n8n-nodes-base.copper","n8n-nodes-base.crateDb","n8n-nodes-base.crypto","n8n-nodes-base.currents","n8n-nodes-base.customerIo","n8n-nodes-base.dataTable","n8n-nodes-base.databricks","n8n-nodes-base.dateTime","n8n-nodes-base.deepL","n8n-nodes-base.demio","n8n-nodes-base.dhl","n8n-nodes-base.discord","n8n-nodes-base.discourse","n8n-nodes-base.drift","n8n-nodes-base.dropbox","n8n-nodes-base.dropcontact","n8n-nodes-base.e2eTest","n8n-nodes-base.egoi","n8n-nodes-base.elasticSecurity","n8n-nodes-base.elasticsearch","n8n-nodes-base.emailSend","n8n-nodes-base.emelia","n8n-nodes-base.erpNext","n8n-nodes-base.executeCommand","n8n-nodes-base.facebookGraphApi","n8n-nodes-base.filemaker","n8n-nodes-base.freshdesk","n8n-nodes-base.freshservice","n8n-nodes-base.freshworksCrm","n8n-nodes-base.gSuiteAdmin","n8n-nodes-base.getResponse","n8n-nodes-base.ghost","n8n-nodes-base.git","n8n-nodes-base.github","n8n-nodes-base.gitlab","n8n-nodes-base.gmail","n8n-nodes-base.goToWebinar","n8n-nodes-base.gong","n8n-nodes-base.googleAds","n8n-nodes-base.googleAnalytics","n8n-nodes-base.googleBigQuery","n8n-nodes-base.googleBooks","n8n-nodes-base.googleBusinessProfile","n8n-nodes-base.googleCalendar","n8n-nodes-base.googleChat","n8n-nodes-base.googleCloudNaturalLanguage","n8n-nodes-base.googleCloudStorage","n8n-nodes-base.googleContacts","n8n-nodes-base.googleDocs","n8n-nodes-base.googleDrive","n8n-nodes-base.googleFirebaseCloudFirestore","n8n-nodes-base.googleFirebaseRealtimeDatabase","n8n-nodes-base.googlePerspective","n8n-nodes-base.googleSheets","n8n-nodes-base.googleSlides","n8n-nodes-base.googleTasks","n8n-nodes-base.googleTranslate","n8n-nodes-base.gotify","n8n-nodes-base.grafana","n8n-nodes-base.graphql","n8n-nodes-base.grist","n8n-nodes-base.hackerNews","n8n-nodes-base.haloPSA","n8n-nodes-base.harvest","n8n-nodes-base.helpScout","n8n-nodes-base.highLevel","n8n-nodes-base.homeAssistant","n8n-nodes-base.httpRequest","n8n-nodes-base.hubspot","n8n-nodes-base.humanticAi","n8n-nodes-base.hunter","n8n-nodes-base.intercom","n8n-nodes-base.invoiceNinja","n8n-nodes-base.iterable","n8n-nodes-base.jenkins","n8n-nodes-base.jinaAi","n8n-nodes-base.jira","n8n-nodes-base.jwt","n8n-nodes-base.kafka","n8n-nodes-base.keap","n8n-nodes-base.koBoToolbox","n8n-nodes-base.ldap","n8n-nodes-base.lemlist","n8n-nodes-base.line","n8n-nodes-base.linear","n8n-nodes-base.lingvaNex","n8n-nodes-base.linkedIn","n8n-nodes-base.loneScale","n8n-nodes-base.magento2","n8n-nodes-base.mailcheck","n8n-nodes-base.mailchimp","n8n-nodes-base.mailerLite","n8n-nodes-base.mailgun","n8n-nodes-base.mailjet","n8n-nodes-base.mandrill","n8n-nodes-base.marketstack","n8n-nodes-base.matrix","n8n-nodes-base.mattermost","n8n-nodes-base.mautic","n8n-nodes-base.medium","n8n-nodes-base.messageAnAgent","n8n-nodes-base.messageBird","n8n-nodes-base.metabase","n8n-nodes-base.microsoftDataverse","n8n-nodes-base.microsoftDynamicsCrm","n8n-nodes-base.microsoftEntra","n8n-nodes-base.microsoftExcel","n8n-nodes-base.microsoftExcelSharePoint","n8n-nodes-base.microsoftGraphSecurity","n8n-nodes-base.microsoftOneDrive","n8n-nodes-base.microsoftOutlook","n8n-nodes-base.microsoftSharePoint","n8n-nodes-base.microsoftSql","n8n-nodes-base.microsoftTeams","n8n-nodes-base.microsoftToDo","n8n-nodes-base.misp","n8n-nodes-base.mistralAi","n8n-nodes-base.mocean","n8n-nodes-base.mondayCom","n8n-nodes-base.mongoDb","n8n-nodes-base.monicaCrm","n8n-nodes-base.mqtt","n8n-nodes-base.msg91","n8n-nodes-base.mySql","n8n-nodes-base.nasa","n8n-nodes-base.netlify","n8n-nodes-base.nextCloud","n8n-nodes-base.nocoDb","n8n-nodes-base.notion","n8n-nodes-base.npm","n8n-nodes-base.odoo","n8n-nodes-base.okta","n8n-nodes-base.oneSimpleApi","n8n-nodes-base.onfleet","n8n-nodes-base.openThesaurus","n8n-nodes-base.openWeatherMap","n8n-nodes-base.oracleDatabase","n8n-nodes-base.oura","n8n-nodes-base.paddle","n8n-nodes-base.pagerDuty","n8n-nodes-base.peekalink","n8n-nodes-base.perplexity","n8n-nodes-base.phantombuster","n8n-nodes-base.philipsHue","n8n-nodes-base.pipedrive","n8n-nodes-base.plivo","n8n-nodes-base.postBin","n8n-nodes-base.postHog","n8n-nodes-base.postgres","n8n-nodes-base.profitWell","n8n-nodes-base.pushbullet","n8n-nodes-base.pushcut","n8n-nodes-base.pushover","n8n-nodes-base.questDb","n8n-nodes-base.quickChart","n8n-nodes-base.quickbase","n8n-nodes-base.quickbooks","n8n-nodes-base.rabbitmq","n8n-nodes-base.raindrop","n8n-nodes-base.reddit","n8n-nodes-base.redis","n8n-nodes-base.rocketchat","n8n-nodes-base.rssFeedRead","n8n-nodes-base.rundeck","n8n-nodes-base.s3","n8n-nodes-base.salesforce","n8n-nodes-base.salesmate","n8n-nodes-base.seaTable","n8n-nodes-base.securityScorecard","n8n-nodes-base.segment","n8n-nodes-base.sendGrid","n8n-nodes-base.sendInBlue","n8n-nodes-base.sendy","n8n-nodes-base.sentryIo","n8n-nodes-base.serviceNow","n8n-nodes-base.shopify","n8n-nodes-base.signl4","n8n-nodes-base.slack","n8n-nodes-base.sms77","n8n-nodes-base.snowflake","n8n-nodes-base.splunk","n8n-nodes-base.spotify","n8n-nodes-base.stackby","n8n-nodes-base.storyblok","n8n-nodes-base.strapi","n8n-nodes-base.strava","n8n-nodes-base.stripe","n8n-nodes-base.supabase","n8n-nodes-base.syncroMsp","n8n-nodes-base.taiga","n8n-nodes-base.tapfiliate","n8n-nodes-base.telegram","n8n-nodes-base.theHive","n8n-nodes-base.theHiveProject","n8n-nodes-base.timescaleDb","n8n-nodes-base.todoist","n8n-nodes-base.totp","n8n-nodes-base.travisCi","n8n-nodes-base.trello","n8n-nodes-base.twake","n8n-nodes-base.twilio","n8n-nodes-base.twist","n8n-nodes-base.twitter","n8n-nodes-base.unleashedSoftware","n8n-nodes-base.uplead","n8n-nodes-base.uproc","n8n-nodes-base.uptimeRobot","n8n-nodes-base.urlScanIo","n8n-nodes-base.venafiTlsProtectCloud","n8n-nodes-base.venafiTlsProtectDatacenter","n8n-nodes-base.vero","n8n-nodes-base.vonage","n8n-nodes-base.webflow","n8n-nodes-base.wekan","n8n-nodes-base.wooCommerce","n8n-nodes-base.wordpress","n8n-nodes-base.xero","n8n-nodes-base.youTube","n8n-nodes-base.yourls","n8n-nodes-base.zammad","n8n-nodes-base.zendesk","n8n-nodes-base.zohoCrm","n8n-nodes-base.zoom","n8n-nodes-base.zulip"];
const CON_APROBACION = ["@n8n/n8n-nodes-langchain.chat","n8n-nodes-base.discord","n8n-nodes-base.emailSend","n8n-nodes-base.gmail","n8n-nodes-base.googleChat","n8n-nodes-base.microsoftOutlook","n8n-nodes-base.microsoftTeams","n8n-nodes-base.slack","n8n-nodes-base.telegram","n8n-nodes-base.wait"];


/* ══════════════════════════════════════════════════════════
   1 · LO QUE TRAJISTE DE LA CLASE 11
   ══════════════════════════════════════════════════════════ */

(function traido() {
  const cont = document.getElementById('traido');
  if (!cont) return;

  const partes = [
    { clave: 'clase11-q1', rot: 'Lo que más te costó escribir',
      hoy: 'Es tu primer pedido. En el armador de más abajo lo vas a convertir en algo que un agente pueda escribir y que vos puedas comprobar.' },
    { clave: 'clase11-q2', rot: 'Tus cinco casos de prueba',
      hoy: 'Hoy cambian de papel: dejan de ser casos para el modelo y pasan a ser el examen de lo que escriba el agente.' }
  ].map(p => ({ ...p, texto: leerGuardado(p.clave) }));

  if (!partes.some(p => p.texto)) {
    cont.innerHTML = `
      <span class="rot">Todavía no hay nada guardado acá</span>
      <p class="vacio" style="margin-top:12px">La actividad de la clase 11 pedía dos cosas: lo que más te costó escribir hasta ahora y cinco casos de prueba de tu proceso. Si la hiciste en otro dispositivo no la voy a ver. Podés completarla en <a href="11.html">la clase 11</a> o traerla pensada: hoy las dos son materia prima.</p>`;
    return;
  }

  cont.innerHTML = '<span class="rot">Lo que escribiste el miércoles</span>' +
    partes.filter(p => p.texto).map(p => `
      <div class="linea">
        <b>${p.rot}</b>
        <p style="white-space:pre-wrap">${escapar(p.texto)}</p>
        <p style="font-size:0.84rem;color:var(--tenue);margin-top:4px">${p.hoy}</p>
      </div>`).join('');
})();


/* ══════════════════════════════════════════════════════════
   2 · UNA SESIÓN, PASO A PASO
   El mismo bucle de la clase 10. Cambian las herramientas.
   ══════════════════════════════════════════════════════════ */

(function sesion() {
  const $pasos = document.getElementById('sesionPasos');
  if (!$pasos) return;
  const $sigue = document.getElementById('sesionSigue');
  const $reset = document.getElementById('sesionReset');
  const $v = document.getElementById('sVueltas');
  const $a = document.getElementById('sArchivos');
  const $c = document.getElementById('sComandos');

  const SI_ESCRIBE = [
    { k: 'herramienta', q: 'Herramienta · escribir archivo', t: 'Crea normalizar.js con la función.', h: 'escribir' },
    { k: 'modelo', q: 'Agente · vuelta 4', t: 'Para saber si está bien no alcanza con leerla: hay que correrla contra los casos. Correr un programa también pide permiso.', c: 'node probar.js' },
    { k: 'humano', q: 'Permiso · ejecutar un comando', t: '¿Lo dejás correr las pruebas?', si: null, no: null }
  ];
  const SI_CORRE = [
    { k: 'herramienta', q: 'Herramienta · ejecutar comando', t: 'Cinco de seis. Falla uno.', c: '✗ "A 0001 00012345" dio "100012345", esperaba "1-12345"', h: 'comando' },
    { k: 'modelo', q: 'Agente · vuelta 5', t: 'Lee el fallo. Su función separaba por guiones y este número viene con espacios. En lugar de separar, ahora toma los grupos de dígitos y se queda con los dos últimos. Si no hay ninguno, devuelve vacío.', c: "const tramos = String(entrada).match(/\\d+/g) || [];\nreturn tramos.slice(-2).map(Number).join('-');" },
    { k: 'herramienta', q: 'Herramienta · escribir archivo', t: 'Corrige normalizar.js. Ya le diste permiso para este archivo en esta sesión.', h: 'escribir' },
    { k: 'herramienta', q: 'Herramienta · ejecutar comando', t: 'Seis de seis.', c: '✓ 6 casos', h: 'comando' },
    { k: 'modelo', q: 'Agente · vuelta 6', t: 'Termina con un resumen: qué escribió, qué caso lo hizo cambiar y en qué modo pegarlo en el nodo Code.' },
    { k: 'fin', q: 'Fin', t: 'Seis vueltas del modelo, dos archivos leídos, dos comandos. Lo que decidió que estaba bien no fue el agente: fueron tus casos.' }
  ];
  const NO_CORRE = [
    { k: 'modelo', q: 'Agente · vuelta 5', t: 'No corre nada. Te deja el comando para que lo corras vos y te avisa que no sabe si la función pasa los casos.' },
    { k: 'fin', q: 'Fin', t: 'El código está escrito pero nadie lo probó. Es exactamente lo mismo que copiarlo de un chat: falta el paso que lo hace confiable.' }
  ];
  const NO_ESCRIBE = [
    { k: 'modelo', q: 'Agente · vuelta 4', t: 'No escribe nada. Te muestra la función en la respuesta para que la copies vos.' },
    { k: 'fin', q: 'Fin', t: 'Funciona como un chat: el agente propuso y vos decidiste. Lo que no hay es prueba.' }
  ];
  SI_ESCRIBE[2].si = SI_CORRE;
  SI_ESCRIBE[2].no = NO_CORRE;

  const PASOS = [
    { k: 'vos', q: 'Vos · el pedido', t: 'Necesito el código de un nodo Code que normalice el número de factura. El pseudocódigo y los casos están en esta carpeta. No cambies los casos.' },
    { k: 'modelo', q: 'Agente · vuelta 1', t: 'Antes de escribir quiere saber qué tiene que dar. Pide leer el archivo de casos.', c: 'leer casos.txt' },
    { k: 'herramienta', q: 'Herramienta · leer archivo', t: 'Seis líneas, una por caso.', c: 'A-0007-00004410 → 7-4410\n0001-00012345 → 1-12345\n…\nsin número → (vacío)', h: 'leer' },
    { k: 'modelo', q: 'Agente · vuelta 2', t: 'Ahora quiere ver cómo llega el dato de verdad, no cómo se lo imagina. Pide leer la muestra que copiaste del panel de n8n.', c: 'leer muestras/item.json' },
    { k: 'herramienta', q: 'Herramienta · leer archivo', t: 'Un ítem real, con los datos personales tapados.', c: '{ "entrada": "A-0007-00004410", "proveedor": "<NOMBRE>" }', h: 'leer' },
    { k: 'modelo', q: 'Agente · vuelta 3', t: 'Escribe una primera versión: separar por guiones, sacar la letra, pasar cada tramo a número. Para guardarla necesita escribir un archivo.', c: 'escribir normalizar.js' },
    { k: 'humano', q: 'Permiso · escribir un archivo', t: 'El agente se detiene y te pregunta. ¿Lo dejás escribir?', si: SI_ESCRIBE, no: NO_ESCRIBE }
  ];

  let cola = [], hechos = [], esperando = false;

  function contar() {
    $v.textContent = hechos.filter(p => p.k === 'modelo').length;
    $a.textContent = hechos.filter(p => p.h === 'leer').length;
    $c.textContent = hechos.filter(p => p.h === 'comando').length;
  }

  function pintar() {
    $pasos.innerHTML = hechos.map((p, n) => `
      <div class="paso-bucle ${p.k === 'vos' ? 'humano' : p.k}">
        <span class="quien">${escapar(p.q)}</span>
        <p>${escapar(p.t)}</p>
        ${p.c ? `<code>${escapar(p.c)}</code>` : ''}
        ${p.k === 'humano' && esperando && n === hechos.length - 1 ? `
          <div class="aprobar">
            <button type="button" class="si" data-d="si">Permitir</button>
            <button type="button" class="no" data-d="no">No permitir</button>
          </div>` : ''}
      </div>`).join('');
    $pasos.scrollTop = $pasos.scrollHeight;
    contar();
    const terminado = !cola.length && !esperando;
    $sigue.disabled = terminado || esperando;
    $sigue.textContent = esperando ? 'Esperando tu respuesta…' : terminado ? 'Terminó' : 'Siguiente paso';
  }

  function paso() {
    if (esperando || !cola.length) return;
    const p = cola.shift();
    hechos.push(p);
    if (p.k === 'humano') esperando = true;
    pintar();
  }

  function decidir(d) {
    const h = hechos[hechos.length - 1];
    esperando = false;
    h.t += d === 'si' ? ' Permitís.' : ' No permitís.';
    cola = (d === 'si' ? h.si : h.no).map(p => ({ ...p }));
    paso();
  }

  function empezar() {
    cola = PASOS.map(p => ({ ...p }));
    hechos = [];
    esperando = false;
    paso();
  }

  $pasos.addEventListener('click', e => {
    const b = e.target.closest('button[data-d]');
    if (b) decidir(b.dataset.d);
  });
  $sigue.addEventListener('click', paso);
  $reset.addEventListener('click', empezar);
  empezar();
})();


/* ══════════════════════════════════════════════════════════
   3 · EL PEDIDO
   El algoritmo, la forma del dato, lo que tiene que salir y los
   casos. Sale texto para pegar en cualquier agente.
   ══════════════════════════════════════════════════════════ */

(function pedido() {
  const $f = document.getElementById('pedido');
  if (!$f) return;
  const $tipo = document.getElementById('pTipo');
  const $salida = document.getElementById('pSalida');
  const $copiar = document.getElementById('pCopiar');
  const campos = ['pQue', 'pPseudo', 'pDato', 'pCasos', 'pVersion', 'pDonde'].reduce((o, id) => (o[id] = document.getElementById(id), o), {});
  let tipo = 'expresion';

  const EJEMPLO = {
    pQue: 'el número de factura normalizado: sin letra, sin ceros a la izquierda en cada tramo y con un guion entre punto de venta y número',
    pPseudo: 'tomar los grupos de dígitos del número\nquedarse con los dos últimos: punto de venta y número\nsacarles los ceros de adelante y unirlos con un guion\nsi no hay ningún dígito, devolver vacío',
    pDato: '{\n  "entrada": "A-0007-00004410",\n  "proveedor": "<NOMBRE>",\n  "monto": "$ 12.900,00"\n}',
    pCasos: CASOS.map(c => `${c.entrada} → ${c.esperado || '(vacío)'}`).join('\n')
  };

  const casosGuardados = leerGuardado('clase11-q2');
  if (casosGuardados) campos.pCasos.value = casosGuardados;

  function armar() {
    const v = k => campos[k].value.trim();
    const version = v('pVersion') || 'la versión que uso';
    const donde = v('pDonde');
    const falta = t => `[${t}]`;
    const cabeza = {
      expresion: `Necesito una expresión de n8n (lo que va entre {{ }}) que devuelva ${v('pQue') || falta('qué tiene que salir')}.`,
      code: `Necesito el código de un nodo Code de n8n, en JavaScript, que deje en cada ítem ${v('pQue') || falta('qué tiene que salir')}.`,
      flujo: `Necesito el JSON de un workflow de n8n, listo para importar, que haga ${v('pQue') || falta('qué tiene que hacer')}.`
    }[tipo];
    const reglas = {
      expresion: [
        'Una sola expresión, sin nodo Code. El ítem actual es $json.',
        'Si el dato falta o viene vacío, que no tire error: que devuelva vacío.'
      ],
      code: [
        'Modo Run Once for Each Item: el ítem actual es $json y se devuelve { json: { ... } } con todos los campos que ya traía más el nuevo.',
        'Nada de la variable items ni de $node[…]: es la manera vieja, que la documentación de n8n ya no muestra.',
        'Sin librerías externas: tiene que andar también en n8n Cloud.',
        'Si el dato falta o viene vacío, que no tire error.'
      ],
      flujo: [
        `Sólo nodos que existan en n8n ${version}, cada uno con una versión (typeVersion) que exista. Si no estás seguro de un parámetro, decilo: no lo inventes.`,
        'Ningún nodo de los que n8n 3.0 elimina: Function, Function Item, Item Lists, Cron, Interval, AI Transform, HTML Extract, Read PDF, Read/Write Binary File.',
        'Sin credenciales ni claves en el JSON: las elijo yo al importar.',
        'Para leer otro nodo, $(\'Nombre del nodo\').item.json, con el nombre exacto que tiene en este mismo JSON.',
        'Los nombres de los nodos en castellano, que digan qué hacen, y una nota (sticky) con el pseudocódigo.'
      ]
    }[tipo];
    const partes = [
      cabeza,
      '',
      'Lo que tiene que hacer, paso a paso:',
      v('pPseudo') || falta('el pseudocódigo'),
      '',
      'Así llega el dato (un ítem real copiado del panel de salida de n8n, con los datos personales tapados):',
      v('pDato') || falta('un ítem real'),
      '',
      'Tiene que pasar estos casos (entrada → resultado esperado):',
      v('pCasos') || falta('los casos'),
      '',
      'Condiciones:',
      `- n8n ${version}${donde ? ', ' + donde : ''}.`,
      ...reglas.map(r => '- ' + r),
      '- No cambies los casos. Si alguno no se puede cumplir, decímelo.',
      '- Explicame en castellano qué hace cada parte.'
    ];
    $salida.textContent = partes.join('\n');
  }

  $tipo.addEventListener('click', e => {
    const b = e.target.closest('button[data-t]');
    if (!b) return;
    tipo = b.dataset.t;
    $tipo.querySelectorAll('button').forEach(x => x.setAttribute('aria-pressed', String(x === b)));
    armar();
  });
  Object.values(campos).forEach(el => el.addEventListener('input', armar));
  document.getElementById('pEjemplo').addEventListener('click', () => {
    Object.entries(EJEMPLO).forEach(([k, t]) => { campos[k].value = t; });
    armar();
  });
  $copiar.addEventListener('click', () => copiar($salida.textContent, $copiar));
  armar();
})();


/* ══════════════════════════════════════════════════════════
   4 · EL PROBADOR
   Corre una expresión o el código de un nodo Code contra los casos,
   acá en el navegador. No es n8n: es un banco de pruebas.
   ══════════════════════════════════════════════════════════ */

(function probador() {
  const $codigo = document.getElementById('prCodigo');
  if (!$codigo) return;
  const $casos = document.getElementById('prCasos');
  const $res = document.getElementById('prResultado');
  const $resumen = document.getElementById('prResumen');
  const $muestras = document.getElementById('prMuestras');

  const MUESTRAS = [
    { rot: 'Respuesta 1', expl: 'La de la clase 9. Separa por guiones: no sabe qué hacer con los espacios.',
      t: "{{ $json.entrada.replace(/[^0-9-]/g, '').split('-').filter(p => p).map(p => Number(p)).join('-') }}" },
    { rot: 'Respuesta 2', expl: 'Saca una letra al principio y los ceros. Parece bien hasta que llega algo que no es una letra.',
      t: "{{ $json.entrada.replace(/^[A-Z]-?/, '').replace(/^0+/, '').replace(/-0+/, '-') }}" },
    { rot: 'Respuesta 3', expl: 'Toma los grupos de dígitos. Resuelve los raros y se olvida del que no trae número.',
      t: "{{ $json.entrada.match(/\\d+/g).slice(-2).map(Number).join('-') }}" },
    { rot: 'Respuesta 4', expl: 'La misma idea, cuidando el caso vacío.',
      t: "{{ ($json.entrada.match(/\\d+/g) || []).slice(-2).map(Number).join('-') }}" },
    { rot: 'Como nodo Code', expl: 'Lo mismo, escrito para un nodo Code en modo Run Once for Each Item. Es el que trae el flujo de la clase.',
      t: "const tramos = String($json.entrada || '').match(/\\d+/g) || [];\nconst obtenido = tramos.slice(-2).map(t => Number(t)).join('-');\n\nreturn { json: { ...$json, obtenido } };" }
  ];

  function leerCasos() {
    return $casos.value.split('\n').map(l => l.trim()).filter(l => l && !/^#/.test(l)).map(l => {
      const m = l.split(/\s*(?:→|->|=>)\s*/);
      let entrada = (m[0] || '').replace(/^\d+[.)]\s+/, '').replace(/^[«"“]|[»"”]$/g, '');
      let esperado = (m.slice(1).join(' → ') || '').replace(/^[«"“]|[»"”]$/g, '');
      if (/^\(vac[ií]o\)$/i.test(esperado)) esperado = '';
      let json;
      if (/^\{/.test(entrada)) { try { json = JSON.parse(entrada); } catch (e) { json = null; } }
      return { linea: l, entrada, esperado, json: json || { entrada } };
    });
  }

  // Entorno mínimo: $json, $input y nada más. Lo que no existe acá se dice.
  function noHay(nombre) {
    return () => { throw new Error(`${nombre} existe adentro de n8n, no en este probador`); };
  }
  function esExpresion(t) { return /^\s*=?\s*\{\{[\s\S]*\}\}\s*$/.test(t); }

  function correr() {
    const texto = $codigo.value;
    const casos = leerCasos();
    if (!texto.trim() || !casos.length) {
      $res.innerHTML = '<p class="sim-vacia">Falta el código o faltan los casos.</p>';
      $resumen.textContent = '';
      return;
    }
    const expresion = esExpresion(texto);
    const items = casos.map(c => ({ json: c.json }));
    const salidas = [];
    const ambiente = (item) => ({
      $json: item.json,
      $input: { item, first: () => items[0], last: () => items[items.length - 1], all: () => items },
      $: noHay('$(\'…\')'), $node: new Proxy({}, { get: noHay('$node') }),
      DateTime: undefined, $now: undefined
    });
    const nombres = ['$json', '$input', '$', '$node', 'DateTime', '$now'];

    try {
      if (expresion) {
        const cuerpo = texto.trim().replace(/^=/, '').trim();
        const partes = cuerpo.match(/^\{\{([\s\S]*)\}\}$/);
        const unaSola = partes && partes[1].indexOf('}}') === -1;
        const fn = unaSola
          ? new Function(...nombres, `return (${partes[1]});`)
          : null;
        items.forEach(item => {
          const a = ambiente(item);
          try {
            const v = fn
              ? fn(...nombres.map(n => a[n]))
              : cuerpo.replace(/\{\{([\s\S]+?)\}\}/g, (_, e) => String(new Function(...nombres, `return (${e});`)(...nombres.map(n => a[n]))));
            salidas.push({ valor: v });
          } catch (e) { salidas.push({ error: e.message }); }
        });
      } else if (/\$input\.all\(\)/.test(texto)) {
        const fn = new Function(...nombres, texto);
        const a = ambiente(items[0]);
        const r = fn(...nombres.map(n => a[n]));
        const lista = Array.isArray(r) ? r : [];
        items.forEach((_, n) => {
          const x = lista[n];
          if (!x) salidas.push({ error: 'no devolvió un ítem para este caso' });
          else salidas.push({ valor: (x.json || x).obtenido });
        });
      } else {
        const fn = new Function(...nombres, texto);
        items.forEach(item => {
          const a = ambiente(item);
          try {
            const r = fn(...nombres.map(n => a[n]));
            const j = r && (r.json || r);
            if (!j || typeof j !== 'object') salidas.push({ error: 'no devolvió un objeto' });
            else if (!('obtenido' in j)) salidas.push({ error: 'el resultado no tiene el campo obtenido' });
            else salidas.push({ valor: j.obtenido });
          } catch (e) { salidas.push({ error: e.message }); }
        });
      }
    } catch (e) {
      $res.innerHTML = `<div class="bit mal"><i>✗</i><span>No se puede ni leer: <b>${escapar(e.message)}</b></span></div>`;
      $resumen.textContent = '';
      return;
    }

    let pasaron = 0;
    $res.innerHTML = casos.map((c, n) => {
      const s = salidas[n] || { error: 'sin resultado' };
      if (s.error) return `<div class="bit mal"><i>✗</i><span><b>${escapar(c.entrada)}</b> · error: ${escapar(s.error)}</span></div>`;
      const dio = s.valor === null || s.valor === undefined ? '' : String(s.valor);
      const ok = dio.trim() === c.esperado.trim();
      if (ok) pasaron++;
      return `<div class="bit ${ok ? 'ok' : 'mal'}"><i>${ok ? '✓' : '✗'}</i><span><b>${escapar(c.entrada)}</b> · dio «${escapar(dio)}»${ok ? '' : `, esperaba «${escapar(c.esperado)}»`}</span></div>`;
    }).join('');
    $resumen.textContent = `${pasaron} de ${casos.length} · ${expresion ? 'leído como expresión' : 'leído como nodo Code'}`;
  }

  $muestras.innerHTML = MUESTRAS.map((m, n) => `<button type="button" data-n="${n}" aria-pressed="false">${escapar(m.rot)}</button>`).join('');
  const $expl = document.getElementById('prExpl');
  $muestras.addEventListener('click', e => {
    const b = e.target.closest('button[data-n]');
    if (!b) return;
    const m = MUESTRAS[+b.dataset.n];
    $muestras.querySelectorAll('button').forEach(x => x.setAttribute('aria-pressed', String(x === b)));
    $codigo.value = m.t;
    $expl.textContent = m.expl;
    correr();
  });
  $casos.value = CASOS.map(c => `${c.entrada} → ${c.esperado || '(vacío)'}`).join('\n');
  document.getElementById('prCorrer').addEventListener('click', correr);
  $muestras.querySelector('button').click();
})();


/* ══════════════════════════════════════════════════════════
   5 · EL REVISOR DE JSON
   Lo que se puede comprobar sin abrir n8n: que el JSON se lea, que
   cada nodo exista en la versión estable con esa versión, que las
   conexiones y las referencias apunten a nodos que están, y las
   trampas conocidas.
   ══════════════════════════════════════════════════════════ */

(function revisor() {
  const $txt = document.getElementById('rvJson');
  if (!$txt) return;
  const $res = document.getElementById('rvResultado');
  const $resumen = document.getElementById('rvResumen');

  const SE_VAN = {
    'n8n-nodes-base.function': 'Code',
    'n8n-nodes-base.functionItem': 'Code',
    'n8n-nodes-base.itemLists': 'Split Out, Aggregate, Sort, Limit, Remove Duplicates o Summarize',
    'n8n-nodes-base.cron': 'Schedule Trigger',
    'n8n-nodes-base.interval': 'Schedule Trigger',
    'n8n-nodes-base.aiTransform': 'Code',
    'n8n-nodes-base.htmlExtract': 'HTML',
    'n8n-nodes-base.readPDF': 'Extract From File',
    'n8n-nodes-base.readBinaryFile': 'Read/Write Files from Disk',
    'n8n-nodes-base.readBinaryFiles': 'Read/Write Files from Disk',
    'n8n-nodes-base.writeBinaryFile': 'Read/Write Files from Disk',
    'n8n-nodes-base.workflowTrigger': 'n8n Trigger',
    '@n8n/n8n-nodes-langchain.manualChatTrigger': 'Chat Trigger',
    '@n8n/n8n-nodes-langchain.code': 'Code',
    '@n8n/n8n-nodes-langchain.toolSerpApi': 'otra herramienta de búsqueda',
    '@n8n/n8n-nodes-langchain.toolHttpRequest': 'HTTP Request usado como herramienta'
  };
  const CONEXIONES = ['main', 'ai_tool', 'ai_languageModel', 'ai_memory', 'ai_outputParser', 'ai_embedding', 'ai_vectorStore', 'ai_document', 'ai_textSplitter', 'ai_retriever', 'ai_reranker', 'ai_chain', 'ai_agent'];
  const SECRETO = /\b(sk-[A-Za-z0-9_-]{16,}|xox[bp]-[A-Za-z0-9-]{10,}|AKIA[0-9A-Z]{16}|gh[pousr]_[A-Za-z0-9]{20,}|AIza[0-9A-Za-z_-]{30,})\b|Bearer\s+[A-Za-z0-9._~+\/-]{12,}/;

  function versiones(tipo) {
    if (TIPOS[tipo]) return TIPOS[tipo];
    const hitl = tipo.match(/^(.*)HitlTool$/);
    if (hitl && CON_APROBACION.includes(hitl[1])) return TIPOS[hitl[1]];
    const tool = tipo.match(/^(.*)Tool$/);
    if (tool && COMO_HERRAMIENTA.includes(tool[1])) return TIPOS[tool[1]];
    return null;
  }

  function textos(o, ruta, fuera) {
    if (typeof o === 'string') fuera.push({ ruta, t: o });
    else if (Array.isArray(o)) o.forEach((x, i) => textos(x, ruta + '[' + i + ']', fuera));
    else if (o && typeof o === 'object') Object.entries(o).forEach(([k, v]) => textos(v, ruta ? ruta + '.' + k : k, fuera));
    return fuera;
  }

  function revisar(crudo) {
    const r = [];
    const mal = t => r.push(['mal', '✗', t]);
    const ojo = t => r.push(['rep', '!', t]);
    const bien = t => r.push(['ok', '✓', t]);
    let wf;
    try { wf = JSON.parse(crudo); } catch (e) { mal(`No es un JSON válido: <b>${escapar(e.message)}</b>. n8n no lo va a poder importar.`); return r; }
    if (!wf || !Array.isArray(wf.nodes)) { mal('No tiene la lista <code>nodes</code>. Así no es un workflow de n8n.'); return r; }
    if (!wf.connections || typeof wf.connections !== 'object') mal('No tiene el objeto <code>connections</code>: los nodos van a llegar sueltos.');
    bien(`Se lee: ${wf.nodes.length} nodos.`);

    const nombres = new Set();
    const porNombre = {};
    let tiposMal = 0;
    wf.nodes.forEach((n, i) => {
      const quien = n && n.name ? `«${escapar(n.name)}»` : `el nodo ${i + 1}`;
      if (!n || typeof n !== 'object') { mal(`El elemento ${i + 1} de <code>nodes</code> no es un nodo.`); return; }
      if (!n.name) mal(`${quien} no tiene nombre.`);
      else if (nombres.has(n.name)) mal(`Hay dos nodos que se llaman «${escapar(n.name)}». Las conexiones van por nombre: una de las dos se pierde.`);
      nombres.add(n.name); porNombre[n.name] = n;
      if (!n.type) { mal(`${quien} no tiene tipo.`); return; }
      if (!Array.isArray(n.position) || n.position.length !== 2) mal(`${quien} no tiene <code>position</code> [x, y].`);
      if (typeof n.parameters !== 'object' || n.parameters === null) mal(`${quien} no tiene <code>parameters</code>.`);
      const vs = versiones(n.type);
      const propio = /^(n8n-nodes-base|@n8n\/n8n-nodes-langchain)\./.test(n.type);
      if (!vs && propio) { tiposMal++; mal(`${quien} es de tipo <code>${escapar(n.type)}</code>, que no figura entre los nodos de n8n ${'2.43.5'}. Es lo primero que inventa un agente.`); }
      else if (!vs) ojo(`${quien} es de tipo <code>${escapar(n.type)}</code>: un nodo de comunidad. Hay que instalarlo, y en n8n 3.0 los no verificados vienen apagados.`);
      else if (typeof n.typeVersion !== 'number') mal(`${quien} no tiene <code>typeVersion</code> numérico.`);
      else if (!vs.includes(n.typeVersion)) { tiposMal++; mal(`${quien} dice versión ${escapar(n.typeVersion)} de <code>${escapar(n.type)}</code>, que no existe. Las que hay: ${vs.join(', ')}.`); }
      if (SE_VAN[n.type]) ojo(`${quien} usa un nodo que n8n 3.0 elimina. En su lugar: ${SE_VAN[n.type]}.`);
      if (n.type === '@n8n/n8n-nodes-langchain.agent' && n.typeVersion < 2) ojo(`${quien} es un AI Agent versión ${n.typeVersion}: la versión 1 se va con n8n 3.0.`);
      if (n.credentials && Object.values(n.credentials).some(c => c && c.id)) ojo(`${quien} trae el id de una credencial de otra instancia. No es un secreto, pero al importar vas a tener que elegir la tuya.`);
    });
    if (!tiposMal) bien('Todos los tipos de nodo existen, con una versión que existe.');

    // Conexiones
    let conMal = 0;
    const entran = new Set(), salen = new Set();
    Object.entries(wf.connections || {}).forEach(([origen, tipos]) => {
      if (!nombres.has(origen)) { conMal++; mal(`Hay conexiones que salen de «${escapar(origen)}», y no hay ningún nodo con ese nombre.`); }
      salen.add(origen);
      Object.entries(tipos || {}).forEach(([tipo, salidas]) => {
        if (!CONEXIONES.includes(tipo)) { conMal++; ojo(`La conexión de tipo <code>${escapar(tipo)}</code> que sale de «${escapar(origen)}» no es de las que conoce n8n.`); }
        (salidas || []).forEach(lista => (lista || []).forEach(d => {
          if (!d || !nombres.has(d.node)) { conMal++; mal(`«${escapar(origen)}» se conecta con «${escapar(d && d.node)}», que no está en el flujo. Al importar, n8n descarta esa conexión sin avisar.`); }
          else entran.add(d.node);
        }));
      });
    });
    if (!conMal) bien('Todas las conexiones van de un nodo que está a otro que está.');

    const sueltos = wf.nodes.filter(n => n && n.name && n.type !== 'n8n-nodes-base.stickyNote' && !entran.has(n.name) && !salen.has(n.name));
    if (sueltos.length) ojo(`Nodos sin ninguna conexión: ${sueltos.map(n => '«' + escapar(n.name) + '»').join(', ')}. Nunca van a correr.`);
    const disparadores = wf.nodes.filter(n => n && n.type && (/Trigger$/.test(n.type) || n.type === 'n8n-nodes-base.webhook'));
    if (!disparadores.length) ojo('No hay ningún disparador. El flujo sólo va a correr a mano o llamado desde otro.');

    wf.nodes.filter(n => n && n.type === '@n8n/n8n-nodes-langchain.agent').forEach(n => {
      const modelo = Object.values(wf.connections || {}).some(t => (t.ai_languageModel || []).some(l => (l || []).some(d => d && d.node === n.name)));
      if (!modelo) ojo(`«${escapar(n.name)}» no tiene modelo conectado. Puede ser a propósito, como en los flujos de la clase 11, pero no va a correr hasta que lo enchufes.`);
    });

    // Expresiones y código
    let refMal = 0, viejas = 0, secretos = 0;
    const gmailCompleto = wf.nodes.some(n => n && n.type === 'n8n-nodes-base.gmailTrigger' && n.parameters && n.parameters.simple === false);
    const avisos = new Set();
    wf.nodes.forEach(n => {
      if (!n || !n.parameters) return;
      const quien = `«${escapar(n.name)}»`;
      const nota = n.type === 'n8n-nodes-base.stickyNote';
      textos(n.parameters, '', []).forEach(({ ruta, t }) => {
        if (SECRETO.test(t)) { secretos++; mal(`${quien} tiene algo que parece una clave escrita en el flujo (en <code>${escapar(ruta)}</code>). Las claves van en una credencial de n8n, nunca en el JSON.`); }
        if (nota) return;
        const re = /\$\(\s*(['"`])(.+?)\1\s*\)/g;
        let m;
        while ((m = re.exec(t))) {
          if (!nombres.has(m[2])) { refMal++; mal(`${quien} lee <code>$('${escapar(m[2])}')</code>, y no hay ningún nodo con ese nombre. En n8n eso da error al ejecutar.`); }
        }
        if (/\$node\s*[\[.]/.test(t)) { viejas++; ojo(`${quien} usa <code>$node[…]</code>, la manera vieja de leer otro nodo. Hoy se escribe <code>$('Nombre').item.json</code>.`); }
        const ref = t.match(/\$node\s*\[\s*["'](.+?)["']\s*\]/);
        if (ref && !nombres.has(ref[1])) { refMal++; mal(`${quien} lee el nodo «${escapar(ref[1])}», que no está en el flujo.`); }
        if (/(jsCode|functionCode)$/.test(ruta) && /(^|[^.\w$])items\b/.test(t) && !avisos.has(n.name + 'items')) {
          avisos.add(n.name + 'items');
          ojo(`${quien} usa la variable <code>items</code>. Todavía anda, pero es la manera del viejo nodo Function y la documentación ya no la muestra: hoy se escribe <code>$input.all()</code>.`);
        }
        if (gmailCompleto && /\$json\.(snippet|attachments)\b|\$json\.from\.(split|match|replace|includes|trim)\b/.test(t) && !avisos.has(n.name + 'gmail')) {
          avisos.add(n.name + 'gmail');
          ojo(`${quien} lee <code>snippet</code>, <code>attachments</code> o trata <code>from</code> como texto. Con el Gmail Trigger en modo completo no llega <code>snippet</code>, <code>attachments</code> viene vacío y <code>from</code> es un objeto. Es el error que tuvieron los flujos de las clases 7, 9 y 10.`);
        }
      });
    });
    if (!refMal) bien('Cada nodo que se nombra en una expresión existe.');
    if (!secretos) bien('No aparece ninguna clave escrita en el flujo.');
    if (wf.pinData && Object.keys(wf.pinData).length) ojo('Trae datos fijados (<code>pinData</code>). Viajan con el JSON: fijate que no haya datos reales de clientes.');
    return r;
  }

  function pintar() {
    const r = revisar($txt.value);
    const c = { ok: 0, rep: 0, mal: 0 };
    r.forEach(x => c[x[0]]++);
    $res.innerHTML = r.map(([k, i, t]) => `<div class="bit ${k}"><i>${i}</i><span>${t}</span></div>`).join('');
    const pl = (n, uno, varios) => `${n} ${n === 1 ? uno : varios}`;
    $resumen.textContent = `${pl(c.mal, 'error', 'errores')} · ${pl(c.rep, 'aviso', 'avisos')} · ${pl(c.ok, 'cosa bien', 'cosas bien')}`;
  }

  // Lo que podría devolver un agente al que se le pidió el flujo de la
  // clase 7 de memoria, sin muestra del dato y sin decirle la versión.
  const DEVUELTO = {
    name: 'Facturas por correo',
    nodes: [
      { parameters: { pollTimes: { item: [{ mode: 'everyMinute' }] }, simple: false, filters: {}, options: {} }, name: 'Llega un correo', type: 'n8n-nodes-base.gmailTrigger', typeVersion: 1.4, position: [0, 0] },
      { parameters: { conditions: { conditions: [{ leftValue: '={{ $json.attachments.length }}', rightValue: 0, operator: { type: 'number', operation: 'gt' } }] } }, name: '¿Trae adjunto?', type: 'n8n-nodes-base.if', typeVersion: 2.2, position: [220, 0] },
      { parameters: { functionCode: "return items.map(i => ({ json: { proveedor: i.json.from.split('<')[0].trim(), asunto: i.json.subject } }));" }, name: 'Leer los datos', type: 'n8n-nodes-base.function', typeVersion: 1, position: [440, 0] },
      { parameters: { operation: 'append', documentId: { __rl: true, mode: 'list', value: '' }, sheetName: { __rl: true, mode: 'list', value: '' } }, name: 'Cargar en la planilla', type: 'n8n-nodes-base.googleSheets', typeVersion: 5, position: [660, -100] },
      { parameters: { chatId: 'PEGAR_CHAT_ID', text: '=Llegó una factura de {{ $node["Leer datos"].json.proveedor }}' }, name: 'Avisar a Marcela', type: 'n8n-nodes-base.telegram', typeVersion: 1.2, position: [660, 100] },
      { parameters: { url: 'https://api.ejemplo.com/padron', sendHeaders: true, headerParameters: { parameters: [{ name: 'Authorization', value: 'Bearer EJEMPLO0000000000000000' }] } }, name: 'Consultar el padrón', type: 'n8n-nodes-base.httpRequest', typeVersion: 4.2, position: [440, 220] }
    ],
    connections: {
      'Llega un correo': { main: [[{ node: '¿Trae adjunto?', type: 'main', index: 0 }]] },
      '¿Trae adjunto?': { main: [[{ node: 'Leer los datos', type: 'main', index: 0 }], []] },
      'Leer los datos': { main: [[{ node: 'Cargar en la planilla', type: 'main', index: 0 }, { node: 'Avisar a Marcela', type: 'main', index: 0 }]] },
      'Cargar en la planilla': { main: [[{ node: 'Archivar el correo', type: 'main', index: 0 }]] }
    }
  };

  async function cargar(ruta, boton) {
    const original = boton.textContent;
    boton.textContent = 'Cargando…';
    try {
      const r = await fetch(ruta);
      if (!r.ok) throw new Error(r.status);
      $txt.value = await r.text();
      pintar();
    } catch (e) {
      $res.innerHTML = '<div class="bit mal"><i>✗</i><span>No pude traer el archivo. Probá de nuevo o pegalo a mano.</span></div>';
    }
    boton.textContent = original;
  }

  document.getElementById('rvDevuelto').addEventListener('click', () => { $txt.value = JSON.stringify(DEVUELTO, null, 2); pintar(); });
  document.getElementById('rvClase11').addEventListener('click', e => cargar('workflows/11-agente-con-contexto-n8n.json', e.currentTarget));
  document.getElementById('rvClase12').addEventListener('click', e => cargar('workflows/12-probar-el-code-n8n.json', e.currentTarget));
  document.getElementById('rvRevisar').addEventListener('click', pintar);
  $txt.value = JSON.stringify(DEVUELTO, null, 2);
  pintar();
})();


/* ══════════════════════════════════════════════════════════
   6 · EL ARCHIVO DE INSTRUCCIONES
   ══════════════════════════════════════════════════════════ */

(function archivo() {
  const $b = document.getElementById('agCopiar');
  if (!$b) return;
  $b.addEventListener('click', () => copiar(document.getElementById('agTexto').textContent, $b));
})();


/* ══════════════════════════════════════════════════════════
   7 · ACTIVIDAD
   ══════════════════════════════════════════════════════════ */

(function actividad() {
  const campos = ['q1', 'q2'];
  const $aviso = document.getElementById('guardado');
  if (!document.getElementById('q1')) return;

  campos.forEach(id => {
    const el = document.getElementById(id);
    el.value = leerGuardado('clase12-' + id);
    let timer;
    el.addEventListener('input', () => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        try {
          localStorage.setItem('clase12-' + id, el.value);
          const hora = new Date().toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });
          $aviso.textContent = `Guardado en este dispositivo a las ${hora}.`;
        } catch (e) {
          $aviso.textContent = 'No pude guardar: el navegador tiene bloqueado el almacenamiento.';
        }
      }, 500);
    });
  });

  if (campos.some(id => leerGuardado('clase12-' + id))) {
    $aviso.textContent = 'Recuperado de tu última visita.';
  }
})();


/* ══════════════════════════════════════════════════════════
   8 · REVELADO AL SCROLL
   ══════════════════════════════════════════════════════════ */

if (!reducido && 'IntersectionObserver' in window) {
  const ojo = new IntersectionObserver(entradas => {
    entradas.forEach(en => {
      if (en.isIntersecting) { en.target.classList.add('visible'); ojo.unobserve(en.target); }
    });
  }, { rootMargin: '0px 0px -12% 0px' });
  document.querySelectorAll('.revelar').forEach(s => ojo.observe(s));
} else {
  document.querySelectorAll('.revelar').forEach(s => s.classList.add('visible'));
}
