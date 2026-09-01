import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Target, 
  History, 
  Settings, 
  User, 
  Plus, 
  Trophy, 
  Info,
  Clock,
  LogOut, 
  ArrowLeft,
  ChevronRight,
  Timer,
  Play,
  Pause,
  Crosshair,
  Trash2,
  Save,
  CheckCircle2,
  Coffee,
  Calendar,
  BarChart3,
  Waves,
  Eye,
  Zap,
  TrendingUp,
  Check,
  Flame,
  Trees,
  Accessibility,
  Flag,
  Box,
  Shield,
  FileText,
  RefreshCw,
  Truck,
  ShieldAlert,
  Download,
  Bell,
  Edit2,
  AlertCircle,
  X
} from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import html2canvas from 'html2canvas';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { trainingService, goalService, eventService, TrainingSession, TrainingSeries, Goal, ScheduledEvent } from './services/db';

import { AdBanner } from './components/AdBanner';

// --- Components ---

// Utility for audio feedback
let audioCtx: AudioContext | null = null;

const translations = {
  pt: {
    nav: { home: 'Início', history: 'Histórico', info: 'Info', settings: 'Definições', record: 'Treino' },
    settings: { 
      title: 'Definições', appearance: 'Aparência', theme: 'Tema Visual', language: 'Idioma', 
      preferences: 'Preferências', sound: 'Som', info: 'Info', version: 'Versão', logout: 'Sair',
      themeLight: 'Claro', themeDark: 'Escuro',
      langPt: 'Português', langEn: 'English',
      supportTitle: 'Apoia o Projeto',
      supportText: 'O teu número de telemóvel não ficará visível. Ajuda a manter o projeto com um café ou uma sandes de presunto.'
    },
    home: { welcome: 'Pronto para o disparo ?', newTraining: 'Novo Treino', newCompetition: 'Nova Prova', stats: 'Estatísticas', statistics: 'Estatísticas Rápidas', avgOverall: 'Média Geral', totalShots: 'Total Tiros', totalTrainings: 'Treinos', totalCompetitions: 'Provas', targets: 'Metas', summary: 'Resumo Global', activeGoals: 'Metas Ativas', latestTrainings: 'Últimos Treinos', precision: 'Foco no alvo', totalPoints: 'Pontos Totais', sessionAvg: 'Média/Sessão', bestTraining: 'Melhor Treino', bestShot: 'Melhor Tiro', maxScore: 'Recorde', seriesRecord: 'Recorde de Série' },
    info: { 
      title: 'Informações', institutional: 'Institucional', regulation: 'Regulamento', downloadPdf: 'ABRIR / DOWNLOAD PDF', 
      pdfOfficial: 'Documento PDF Oficial (FPT)', officialDoc: 'Consulta aqui o documento oficial da Federação Portuguesa de Tiro (FPTiro)', 
      titleReg: 'REGULAMENTO DE LICENÇAS FEDERATIVAS', internationalOrg: 'Organismo Internacional', framing: 'Enquadramento', 
      precisionTitle: 'TIRO DESPORTIVO DE PRECISÃO', olympic: 'Tiro Olímpico', nonOlympic: 'Tiro Não Olímpico',
      catBenchrest: 'Benchrest', catBenchrestSub: 'Alta Precisão', catAdaptado: 'Adaptado', catAdaptadoSub: 'Tiro Paralímpico', catFederacao: 'Federação',
      issfFrame1: 'Modalidade desportiva praticada por milhares de atletas em todo o mundo, integrada nos Jogos Olímpicos da era moderna. É tutelada em Portugal pela Federação Portuguesa de Tiro, Instituição sem fins lucrativos, com o Estatuto de Utilidade Pública Desportiva, fundada em 1948.',
      issfFrame2: 'A FPT sucedeu à Federação do Tiro Nacional Português, criada pelo Decreto n.º 2234 de 24/02/1916 e esta sucedeu à União dos Atiradores Civis Portugueses, criada por Decreto Régio do Rei D. Carlos, exímio atirador, datado de 1893 e é a mais alta entidade do Tiro de Precisão em Portugal.',
      issfQuote: '"Tiro é um desporto que implica grande concentração e bons reflexos. A sua prática requer formação específica e disciplina."',
      pistol10m: 'Pistola 10 metros – Homens e Senhoras',
      pistol10mDesc: 'A prova consta de 60 tiros, efetuados na posição de pé, usando uma das mãos, para um alvo, com as dimensões de 170x170m/m, colocado a uma distância de 10 metros, no tempo máximo de 01h15 (H e S), antecedida de um número ilimitado de tiros de ensaio no tempo de 15 min, se forem usados alvos eletrónicos. Se forem usados alvos de papel o tempo de prova é de 01H30, igualmente antecedida de um número ilimitado de tiros de ensaio no tempo de 15 min. O calibre utilizado é o 4,5m/m, sendo de 500 gramas o peso mínimo do gatilho.',
      pistol25mVel: 'Pistola de Velocidade 25 metros – Homens',
      pistol25mVelDesc: 'A prova consta de 60 tiros, efectuados na posição de pé, com uma das mãos, para um conjunto de 5 alvos, com as dimensões de 500x500m/m, colocados a uma distância de 25 metros, em que o atirador dispara um tiro para cada alvo, em 4 séries de 5 tiros no tempo de 8 segundos, 4 séries de 5 tiros no tempo de 6 segundos e 4 séries de 5 tiros no tempo de 4 segundos, divididas em duas partes de 30 tiros. O calibre utilizado é o .22lr, sendo de 1000 gramas o peso mínimo do gatilho.',
      pistol25mSen: 'Pistola 25 metros – Senhoras',
      pistol25mSenDesc: 'A prova consta de 60 tiros, efectuados na posição de pé, com uma das mãos, para um alvo, com as dimensões de 500x500m/m, colocado a uma distância de 25 metros, divididos em duas partes de 30 tiros. Na primeira a atiradora dispara 6 séries de 5 tiros no tempo de 5 minutos por série, precedida de uma série de ensaio de 5 tiros em 5 minutos. Na segunda a atiradora efectua 6 séries de cinco tiros, e por série dispara, com o braço apontado para baixo, colocado num ângulo de 45º em relação ao solo, um tiro em cada abertura do alvo, no tempo de 3 segundos. Após cada disparo o alvo roda e permanece na posição de topo durante 7 segundos e assim sucessivamente, até completar a série de 5 tiros. É efectuada uma série de ensaio de 5 tiros nas mesmas condições. O calibre utilizado é o .22lr, sendo de 1000 gramas o peso mínimo do gatilho.',
      rifle10m: 'Carabina 10 metros – Homens e Senhoras',
      rifle10mDesc: 'A prova consta de 60 tiros H / 60 tiros S, efetuados na posição de pé, para um alvo, com as dimensões de 80x80m/m, colocado a uma distância de 10 metros, no tempo máximo de 01h15 (H e S), antecedida de um número ilimitado de tiros de ensaio no tempo de 15 min, se forem usados alvos eletrónicos. Se forem usados alvos de papel o tempo de prova é de 01H30, igualmente antecedida de um número ilimitado de tiros de ensaio no tempo de 15 min. O calibre utilizado é o 4,5m/m, sendo livre o peso do gatilho.',
      rifle50m3p: 'Carabina 3 Posições (3x40Tiros) - Homens e Senhoras',
      rifle50m3pDesc: 'A prova consta de 120 tiros, efetuados em três posições, de Joelhos (40T), deitado (40T) e de Pé (40T), por esta ordem, para um alvo, com as dimensões de 250x250m/m, colocado a uma distância de 50 metros, no tempo máximo de 02H45 min, antecedida de um número ilimitado de tiros de ensaio no tempo de 15 min, se forem usados alvos eletrónicos. Se forem utilizados alvos de fosso, transportadores ou outros sistemas, o tempo de prova é de 03H15 min, igualmente antecedida de um número ilimitado de tiros de ensaio no tempo de 15 min. O calibre utilizado é o .22lr, sendo livre o peso do gatilho.',
      pistol50mH: 'Pistola 50 metros – Homens',
      pistol50mHDesc: 'A prova consta de 60 tiros efetuados para um alvo, colocado a uma distância de 50 metros, com as dimensões de 500x500m/m, na posição de pé, usando uma das mãos, no tempo máximo de 01h30, antecedida de um número ilimitado de tiros de ensaio no tempo de 15 min, se forem usados alvos eletrónicos. Se forem usados alvos de papel o tempo de prova é de 01H45, igualmente antecedida de um número ilimitado de tiros de ensaio no tempo de 15 min O calibre utilizado é o .22lr, sendo livre o peso do gatilho.',
      pistolCentralH: 'Pistola de Percussão Central – Homens',
      pistolCentralHDesc: 'A prova consta de 60 tiros, efectuados na posição de pé, com uma das mãos, para um alvo, com as dimensões de 500x500m/m, colocado a uma distância de 25 metros, divididos em duas partes de 30 tiros. Na primeira o atirador dispara 6 séries de 5 tiros no tempo de 5 minutos por série, precedida de uma série de ensaio de 5 tiros em 5 minutos. Na segunda o atirador efectua 6 séries de cinco tiros, e por série dispara, com o braço apontado para baixo, colocado num ângulo de 45º em relação ao solo, um tiro em cada abertura do alvo, no tempo de 3 segundos. Após cada disparo o alvo roda e permanece na posição de topo durante 7 segundos e assim sucessivamente até completar a série de 5 tiros. É efectuada uma série de ensaio de 5 tiros nas mesmas condições. Podem ser utilizados calibres de .30 a .38, sendo de 1000 gramas o peso mínimo do gatilho.',
      pistolStandardH: 'Pistola Standard 25 metros – Homens',
      pistolStandardHDesc: 'A prova consta de 60 tiros, efectuados na posição de pé, com uma das mãos, para um alvo, com as dimensões de 500x500m/m, colocado a uma distância de 25 metros, divididos em três partes de 20 tiros. Na primeira parte o atirador efectua 4 séries de 5 tiros, no tempo de 150 segundos cada série. Na segunda efectua 4 séries de 5 tiros no tempo de 20 seg. cada série e na terceira efectua 4 séries de 5 tiros no tempo de 10 seg. cada série. O calibre utilizado é o .22lr, sendo de 1000 gramas o peso mínimo do gatilho.',
      rifle300m3pH: 'Carabina 3 posições (3x40T) 300 metros – Homens',
      rifle300m3pHDesc: 'A prova consta de 120 tiros, efetuados em três posições, Joelhos (40T), deitado (40T), e Pé (40T), por esta ordem, para um alvo, com as dimensões de 1020x1020m/m, colocado a uma distância de 300 metros, no tempo máximo de 03H00, antecedida de um número ilimitado de tiros de ensaio no tempo de 15 min, se forem usados alvos eletrónicos. Se forem usados alvos de fosso, transportadores ou outros sistemas, o tempo de prova é de 03H30, igualmente antecedida de um número ilimitado de tiros de ensaio no tempo de 15 min. O calibre máximo utilizado é de 8m/m, sendo livre o peso do gatilho.',
      ipscHistoryDesc1: 'Com origem na Califórnia durante a década de cinquenta, rapidamente foi adoptado noutros continentes, nomeadamente, Europa, Oceânia, Africa e restante continente americano.',
      ipscHistoryDesc2: 'A federação que tutela esta vertente do Tiro, conhecida pelo acrónimo I.P.S.C. (International Practical Shooting Federation), nasceu nos E.U.A., em Columbia no estado do Missouri em maio de 1976.',
      ipscHistoryDesc3: 'Praticado em mais de sessenta países, denominados por Regiões.',
      ipscRequirements: 'Requisitos para Atletas',
      ipscReq1: 'Estar inscrito num clube desportivo.',
      ipscReq2: 'Estar filiado na Federação Portuguesa de Tiro.',
      ipscReq3: 'Possuir licença federativa tipo C e curso IPSC.',
      mlaicHistoryDesc: 'O renascimento do tiro com pólvora preta começou em meados do século passado. Juntando a História ao tiro desportivo, evoluiu-se para uma combinação única de actividades culturais e desportivas que se difundiram por todo o mundo.',
      mlaicEntity: 'Entidade Internacional: M.L.A.I.C. (Muzzle Loaders Associations International Confederation).',
      mlaicHighlights: 'Destaques FPT',
      mlaicHighlightsDesc: 'Organização do XXIV World Championship (2010) e XVI European Championship (2015).',
      mlaicClassification: 'Classificação',
      mlaicOriginalDesc: 'Manufacturadas antes de 1899.',
      mlaicReplicaDesc: 'Reproduções de originais.',
      mlaicDisciplinesDesc: 'Armas de carregamento pela boca: pistolas (percussão, pederneira, mecha), revólveres, mosquetes, carabinas e espingardas.',
      mlaic13Shots: '13 Tiros (10 melhores)',
      mlaicHandgun: 'Arma Curta',
      mlaicLonggun: 'Arma Longa',
      benchrestDesc: 'O Benchrest é uma modalidade de tiro praticada com a carabina assente em dois apoios (frontal e traseiro) sobre uma mesa/bancada, estando o atleta sentado.',
      benchrestGroupingDesc: 'Vários tiros tão próximos quanto possível num mesmo alvo.',
      benchrestCenterDesc: 'Um tiro por alvo com o objetivo de obter a pontuação máxima.',
      benchrestAir: 'Carabina de Ar Comprimido',
      benchrestRimfire: 'Carabina de Calibre .22LR',
      benchrestCenterfire: 'Carabina de Percussão Central',
      benchrestEquipmentNote: 'É uma modalidade que privilegia o detalhe e a qualidade do equipamento.',
      internationalAffiliations: 'Afiliações Internacionais',
      benchrestFptOrg: 'A F.P.T. organizou o 2º World Rimfire Championship (2016) sob a égide da W.B.S.F.',
      adaptadoIntro: 'Parte dos Jogos Paralímpicos desde 1976. Regulado pelo IPC e coordenado pelo IPC Shooting, com base nas regras modificadas da ISSF. Aberto a atletas com deficiências físicas e visuais.',
      adaptadoClassesDesc: 'SH1 e SH2 - Permitem a competição individual e por equipas.',
      p1Desc: '60 tiros em 01h45. Alvo 170x170mm a 10m. Calibre 4,5mm.',
      p2Desc: '40 tiros em 01h15. Alvo 170x170mm a 10m. Calibre 4,5mm.',
      p3Desc: '60 tiros (30 precisão + 30 velocidade). Calibre .22lr.',
      p4Desc: '60 tiros em 02h00. Alvo 500x500mm a 50m. Calibre .22lr.',
      r1r2Desc: 'R1 (H): 60 tiros / 01h30. R2 (S): 40 tiros / 01h00. Calibre 4,5mm.',
      r3Desc: '60 tiros em 01h00. Distância 10m. Calibre 4,5mm.',
      r4Desc: '60 tiros em 01h30. Distância 10m. Calibre 4,5mm.',
      r5Desc: '60 tiros em 01h10. Distância 10m. Calibre 4,5mm.',
      r6Desc: '60 tiros em 01h00. Alvo 250x250mm a 50m. Calibre .22lr.',
      wftfScenario: 'O Cenário Natural',
      wftfScenarioDesc1: 'É um desporto praticado ao ar livre que utiliza os obstáculos naturais e a vegetação do terreno para criar situações de tiro muito variadas e por vezes inesperadas.',
      wftfScenarioDesc2: 'Ao contrário do tiro estático em stand, no Field Target os atiradores percorrem um cenário natural com várias pistas. Cada pista tem alvos metálicos espalhados aleatoriamente em distâncias entre os 10 e os 50 metros.',
      wftfQuote: '"É necessário saber ler o vento e a miragem, assim como ter uma grande familiaridade com a balística da arma."',
      wftfTechnique: 'Os Alvos e a Técnica',
      wftfSilhouettes: 'Silhuetas Metálicas',
      wftfSilhouettesDesc: 'Os alvos são silhuetas de animais (ratazanas, coelhos, pássaros) com um orifício circular (zona de abate).',
      wftfPhysics: 'Fisica e Óptica',
      wftfPhysicsDesc: 'Através da paralaxe da mira telescópica, o atirador estima a distância do alvo e ajusta a compensação do tiro.',
      safety: 'Normas de Segurança', ranks: 'Categorias / Escalões', documents: 'Documentação Atleta', international: 'Organismos Intern.',
      historyOrigin: 'História e Origem', lema: 'Lema Primordial', ipscPortugal: 'IPSC em Portugal', ipscPortugalDesc: 'Introduzida em 1993 por Guilherme Chitas, Paulo Aires, José Pêgo e Fernando Almeida. Apenas permitidas competições com arma curta (calibre mínimo 9x19mm).', gunpowder: 'Pólvora Preta e História',
      weaponsCategories: 'Armas e Categorias', nationalDisciplines: 'Disciplinas Nacionais', provasPortugal: 'Provas em Portugal', bulletPrecision: 'Provas de Bala & Precisão', ordinanceWeapons: 'Armas de Ordenança',
      searchCenter: 'A Busca pelo Centro', functionalClasses: 'Classes Funcionais', disciplines: 'Disciplinas', distances: 'Distâncias', duration: 'Duração',
      original: 'Original', replica: 'Réplica', grouping: 'Agrupamento', targetCenter: 'Tiro ao Centro',
      intConfed: 'Confederação Internacional', muzzleLoading: 'Carregamento Frontal', highPrecision: 'Alta Precisão',
      fedTitle: 'Competições Nacionais', fedNationalDisc: 'Disciplinas Nacionais', 
      fedCarabinaCano: 'Carabina de Cano Articulado', fedCarabinaCanoDesc: 'Disciplina atraente pela simplicidade: Carabina 4,5mm, cano articulado. 40 tiros em 1h, posição de pé, alvo a 10m.',
      fedPistola5T: 'Pistola 5 Tiros', fedPistola5TPDesc: 'Precisão: 1 série de ensaio + 4 séries de 5 tiros em 150 seg.', fedPistola5TVDesc: 'Velocidade: 1 série de ensaio + 4 séries de 5 tiros em 20 seg.',
      fedPistolaAr: 'Pistola de Ar Comprimido', fedPistolaArDesc: 'Disciplina regional/nacional. 40 tiros em 1h15 (H/M), alvo a 10m. Calibre 4,5mm.',
      fedVelocidade: 'Velocidade', fedVelocidadeDesc: 'Derrubar 5 alvos metálicos a 10m em 10s. H: 40 tiros / S: 30 tiros.',
      fedStandard: 'Standard', fedStandardDesc: 'Séries de 5 tiros em alvo de papel a 10m em 10s. H: 40 tiros / S: 30 tiros.',
      fedAr50: 'AR 50', fedAr50Desc: 'Pistola e Carabina de ar comprimido. Disputada em 3 fases: qualificação, semifinais e finais por medalhas.',
      fedEquipasMistas: 'Equipas Mistas', fedBalaPrecisao: 'Provas de Bala & Precisão',
      fedRecreio25m: 'Arma Curta de Recreio a 25m', fedRecreio25mDesc: '30 tiros (6 séries de 5 t em 5 min). Iniciação ao calibre .22LR com foco exclusivo em precisão.',
      fedOrdinance: 'Armas de Ordenança', fedOrdinanceDesc: 'Pistola e Revólver de Ordenança a 25m. 30 tiros (6 séries de 5 t em 5 min). Calibres 7,62mm a 11,6mm.',
      wftfPositions: 'Posições de Tiro', wftfPositionsDesc: 'Embora a maioria dos tiros seja em posição livre, os obstáculos naturais forçam o domínio de várias posições.',
      wftfEquip: 'Equipamento Básico', wftfWeapons: 'Armas de Ar Comprimido', wftfWeaponsDesc: 'PCP ou Mola com potência inferior a 24 Joules.',
      wftfScope: 'Mira Telescópica', wftfScopeDesc: 'Objetiva ajustável para correção de paralaxe (foco a partir de 10m).'
    },
    general: { pts: 'Pontos', meters: 'metros', back: 'Voltar', save: 'Guardar', cancel: 'Cancelar', finish: 'Finalizar', delete: 'Eliminar', edit: 'Editar', loading: 'A carregar...', continue: 'Continuar', pause: 'Pausar', enter: 'ENTRAR', deleteError: 'Erro ao eliminar o registo. Por favor tente novamente.', avg: 'média' },
    training: { 
      new: 'Novo Treino', active: 'Treino Ativo', activeCompetition: 'Prova Ativa', session: 'Sessão', rounds: 'Séries', shots: 'Tiros', score: 'Pontuação', target: 'Meta', total: 'Total', recommended: 'Treino Recomendado', training: 'Treino',
      seriesOf: 'Série {{current}} de {{total}}', shotOf: 'Disparo {{current}}/{{total}}', warmup: 'Aquecimento', competition: 'Prova', competitionName: 'Nome da Prova', configWeapon: 'Configuração de Arma',
      baseConfig: 'Configuração Base', numSeries: 'Nº de Séries', shotsPerSeries: 'Tiros por Série', totalShots: 'Total: {{count}} tiros', timePerSeries: 'Tempo Série (seg)', scoreGoal: 'Meta',
      equipmentAmmo: 'Equipamento & Munição', weapon: 'Arma', caliber: 'Calibre', distance: 'Distância', start: 'Iniciar Treino', startCompetition: 'Iniciar Prova', pistol: 'Pistola', rifle: 'Carabina', instructorNotes: 'Notas do Instrutor',
      waitingShot: 'Aguardando disparo', totalShotsOfficial: 'Tiros de Prova', ammoBrand: 'Munição', weaponModel: 'Arma (Marca/Modelo)', targetType: 'Alvo', customize: 'Personalizar', time: 'Tempo',
      schedule: 'Agendar', scheduledEvents: 'Eventos Agendados', noEvents: 'Sem eventos agendados', addEvent: 'Novo Agendamento', eventName: 'Nome do Evento', eventDate: 'Data', eventTime: 'Horário'
    },
    history: { 
      title: 'Histórico', 
      compare: 'Comparar', 
      noData: 'Nenhum treino registado ainda.', 
      cloud: 'Nuvem', 
      exit: 'Sair', 
      details: 'Detalhes do Treino', 
      detailsCompetition: 'Detalhes da Prova',
      editRecord: 'Editar Registo',
      editScores: 'Editar Pontos & Séries',
      editDetails: 'Editar Equipamento & Munição',
      editNotes: 'Editar Notas',
      editDate: 'Editar Data',
      seriesBreakdown: 'Séries & Disparos',
      addSeries: 'Adicionar Série',
      deleteSeries: 'Eliminar Série',
      addShot: 'Adicionar Disparo',
      deleteShot: 'Remover Disparo'
    },
    goals: { deleteConfirm: 'Eliminar esta meta?', deleteTitle: 'Eliminar Meta', target: 'Meta', complete: 'completo', completed: 'CONCLUÍDO', inProgress: 'EM PROGRESSO' },
    results: { title: 'Treino Concluído', titleCompetition: 'Prova Concluída', subtitle: 'Bom trabalho. Continua a praticar.', success: 'Parabéns!', reached: 'Meta Alcançada!', almost: 'Quase lá!', focus: 'Foco e Treino!', totalPoints: 'Pontos Totais', avgShot: 'Média / Tiro', perShot: 'por tiro', progress: 'Progresso Meta', save: 'Terminar e Gravar', next: 'Seguinte', showResults: 'Mostrar resultado', weapon: 'Arma', distance: 'Distância', series: 'Séries', warmup: 'Aquecimento' },
    compare: { title: 'Comparação', performanceBySeries: 'Desempenho por Série', series: 'Série', consistency: 'Consistência', analysis: 'Análise Comparativa' }
  },
  en: {
    nav: { home: 'Home', history: 'History', info: 'Info', settings: 'Settings', record: 'Training' },
    settings: { 
      title: 'Settings', appearance: 'Appearance', theme: 'Visual Theme', language: 'Language', 
      preferences: 'Preferences', sound: 'Sound', info: 'Info', version: 'Version', logout: 'Logout',
      themeLight: 'Light', themeDark: 'Dark',
      langPt: 'Português', langEn: 'English',
      supportTitle: 'Support the Project',
      supportText: 'Your phone number will not be visible. Help keep the project going with a coffee or a ham sandwich.'
    },
    home: { welcome: 'Ready to fire?', newTraining: 'New Training', newCompetition: 'New Competition', stats: 'Statistics', statistics: 'Quick Statistics', avgOverall: 'Overall Average', totalShots: 'Total Shots', totalTrainings: 'Trainings', totalCompetitions: 'Competitions', targets: 'Goals', summary: 'Global Summary', activeGoals: 'Active Goals', latestTrainings: 'Latest Trainings', precision: 'Focus on target', totalPoints: 'Total Points', sessionAvg: 'Avg/Session', bestTraining: 'Best Training', bestShot: 'Best Shot', maxScore: 'Record', seriesRecord: 'Series Record' },
    info: { 
      title: 'Information', institutional: 'Institutional', regulation: 'Regulation', downloadPdf: 'OPEN / DOWNLOAD PDF', 
      pdfOfficial: 'Official PDF Document (FPT)', officialDoc: 'Consult the official document of the Portuguese Shooting Federation (FPTiro) here', 
      titleReg: 'FEDERAL LICENSING REGULATION', internationalOrg: 'International Body', framing: 'Framework', 
      precisionTitle: 'PRECISION SPORT SHOOTING', olympic: 'Olympic Shooting', nonOlympic: 'Non-Olympic Shooting',
      catBenchrest: 'Benchrest', catBenchrestSub: 'High Precision', catAdaptado: 'Adapted', catAdaptadoSub: 'Paralympic Shooting', catFederacao: 'Federation',
      issfFrame1: 'Sporting modality practiced by thousands of athletes worldwide, integrated into the modern Olympic Games. It is supervised in Portugal by the Portuguese Shooting Federation, founded in 1948.',
      issfFrame2: 'FPT succeeded the Portuguese National Shooting Federation, created by Decree No. 2234 of 02/24/1916 and it succeeded the Union of Portuguese Civil Shooters, created by Royal Decree of King D. Carlos, an expert shooter, dated 1893 and is the highest entity of Precision Shooting in Portugal.',
      issfQuote: '"Shooting is a sport that implies great concentration and good reflexes. Its practice requires specific training and discipline."',
      pistol10m: '10m Pistol – Men and Women',
      pistol10mDesc: 'The competition consists of 60 shots, carried out in a standing position, using one hand, for a target with dimensions of 170x170mm, placed at a distance of 10 meters, in a maximum time of 01:15 (M and W), preceded by an unlimited number of practice shots in 15 min, if electronic targets are used. If paper targets are used, the time is 01:30, also preceded by an unlimited number of practice shots in 15 min. The caliber used is 4.5mm, with 500 grams being the minimum trigger weight.',
      pistol25mVel: '25m Rapid Fire Pistol – Men',
      pistol25mVelDesc: 'The competition consists of 60 shots, carried out in a standing position, with one hand, for a set of 5 targets, with dimensions of 500x500mm, placed at a distance of 25 meters, where the shooter fires one shot at each target, in 4 series of 5 shots in 8 seconds, 4 series of 5 shots in 6 seconds and 4 series of 5 shots in 4 seconds, divided into two parts of 30 shots. The caliber used is .22lr, with 1000 grams being the minimum trigger weight.',
      pistol25mSen: '25m Pistol – Women',
      pistol25mSenDesc: 'The competition consists of 60 shots, carried out in a standing position, with one hand, for a target with dimensions of 500x500mm, placed at a distance of 25 meters, divided into two parts of 30 shots. In the first part, the shooter fires 6 series of 5 shots in 5 minutes per series, preceded by a practice series of 5 shots in 5 minutes. In the second part, the shooter performs 6 series of five shots, and in each series fires, with the arm pointing down, placed at an angle of 45º in relation to the ground, one shot at each opening of the target, in 3 seconds. After each shot, the target rotates and remains in the top position for 7 seconds and so on, until completing the series of 5 shots. A practice series of 5 shots is performed under the same conditions. The caliber used is .22lr, with 1000 grams being the minimum trigger weight.',
      rifle10m: '10m Rifle – Men and Women',
      rifle10mDesc: 'The competition consists of 60 shots (M/W), carried out in a standing position, for a target with dimensions of 80x80mm, placed at a distance of 10 meters, in a maximum time of 01:15 (M and W), preceded by an unlimited number of practice shots in 15 min, if electronic targets are used. If paper targets are used, the time is 01:30, also preceded by an unlimited number of practice shots in 15 min. The caliber used is 4.5mm, with trigger weight being free.',
      rifle50m3p: '50m Rifle 3 Positions (3x40 Shots) - Men and Women',
      rifle50m3pDesc: 'The competition consists of 120 shots, performed in three positions: Kneeling (40S), Prone (40S), and Standing (40S), in that order, for a target with dimensions of 250x250mm, placed at a distance of 50 meters, in a maximum time of 02:45 min, preceded by an unlimited number of practice shots in 15 min, if electronic targets are used. If pit targets, transporters or other systems are used, the time is 03:15 min, also preceded by an unlimited number of practice shots in 15 min. The caliber used is .22lr, with trigger weight being free.',
      pistol50mH: '50m Pistol – Men',
      pistol50mHDesc: 'The competition consists of 60 shots fired at a target, placed at a distance of 50 meters, with dimensions of 500x500mm, in a standing position, using one hand, in a maximum time of 01:30, preceded by an unlimited number of practice shots in 15 min, if electronic targets are used. If paper targets are used, the time is 01:45, also preceded by an unlimited number of practice shots in 15 min. The caliber used is .22lr, with trigger weight being free.',
      pistolCentralH: 'Centerfire Pistol – Men',
      pistolCentralHDesc: 'The competition consists of 60 shots, carried out in a standing position, with one hand, for a target with dimensions of 500x500mm, placed at a distance of 25 meters, divided into two parts of 30 shots. In the first part, the shooter fires 6 series of 5 shots in 5 minutes per series, preceded by a practice series of 5 shots in 5 minutes. In the second part, the shooter performs 6 series of five shots, and in each series fires, with the arm pointing down, placed at an angle of 45º in relation to the ground, one shot at each opening of the target, in 3 seconds. After each shot, the target rotates and remains in the top position for 7 seconds and so on until completing the series of 5 shots. A practice series of 5 shots is performed under the same conditions. Calibers from .30 to .38 can be used, with 1000 grams being the minimum trigger weight.',
      pistolStandardH: 'Standard Pistol 25 meters – Men',
      pistolStandardHDesc: 'The competition consists of 60 shots, carried out in a standing position, with one hand, for a target with dimensions of 500x500mm, placed at a distance of 25 meters, divided into three parts of 20 shots. In the first part, the shooter performs 4 series of 5 shots, in 150 seconds each series. In the second part, 4 series of 5 shots in 20 sec. each series and in the third part 4 series of 5 shots in 10 sec. each series. The caliber used is .22lr, with 1000 grams being the minimum trigger weight.',
      rifle300m3pH: '300m Rifle 3 positions (3x40 Shots) – Men',
      rifle300m3pHDesc: 'The competition consists of 120 shots, performed in three positions: Kneeling (40S), Prone (40S), and Standing (40S), in that order, for a target with dimensions of 1020x1020mm, placed at a distance of 300 meters, in a maximum time of 03:00, preceded by an unlimited number of practice shots in 15 min, if electronic targets are used. If pit targets, transporters or other systems are used, the time is 03:30, also preceded by an unlimited number of practice shots in 15 min. The maximum caliber used is 8mm, with trigger weight being free.',
      ipscHistoryDesc1: 'Originating in California during the fifties, it was quickly adopted in other continents, namely Europe, Oceania, Africa, and the rest of the American continent.',
      ipscHistoryDesc2: 'The federation that supervises this branch of Shooting, known by the acronym I.P.S.C. (International Practical Shooting Federation), was born in the U.S.A., in Columbia, Missouri, in May 1976.',
      ipscHistoryDesc3: 'Practiced in more than sixty countries, called Regions.',
      ipscRequirements: 'Requirements for Athletes',
      ipscReq1: 'Be enrolled in a sports club.',
      ipscReq2: 'Be affiliated with the Portuguese Shooting Federation.',
      ipscReq3: 'Possess a type C federal license and an IPSC course.',
      mlaicHistoryDesc: 'The renaissance of black powder shooting began in the middle of the last century. Joining History to sport shooting, it evolved into a unique combination of cultural and sporting activities that spread worldwide.',
      mlaicEntity: 'International Entity: M.L.A.I.C. (Muzzle Loaders Associations International Confederation).',
      mlaicHighlights: 'FPT Highlights',
      mlaicHighlightsDesc: 'Organization of the XXIV World Championship (2010) and XVI European Championship (2015).',
      mlaicClassification: 'Classification',
      mlaicOriginalDesc: 'Manufactured before 1899.',
      mlaicReplicaDesc: 'Reproductions of originals.',
      mlaicDisciplinesDesc: 'Muzzle-loading weapons: pistols (percussion, flintlock, matchlock), revolvers, muskets, rifles, and shotguns.',
      mlaic13Shots: '13 Shots (best 10)',
      mlaicHandgun: 'Short Weapon',
      mlaicLonggun: 'Long Weapon',
      benchrestDesc: 'Benchrest is a shooting modality practiced with the rifle resting on two supports (front and rear) on a table/bench, with the athlete seated.',
      benchrestGroupingDesc: 'Several shots as close as possible in the same target.',
      benchrestCenterDesc: 'One shot per target with the objective of obtaining maximum score.',
      benchrestAir: 'Air Rifle',
      benchrestRimfire: '.22LR Caliber Rifle',
      benchrestCenterfire: 'Centerfire Rifle',
      benchrestEquipmentNote: 'It is a modality that privileges the detail and quality of the equipment.',
      internationalAffiliations: 'International Affiliations',
      benchrestFptOrg: 'F.P.T. organized the 2nd World Rimfire Championship (2016) under the aegis of W.B.S.F.',
      adaptadoIntro: 'Part of the Paralympic Games since 1976. Regulated by the IPC and coordinated by IPC Shooting, based on modified ISSF rules. Open to athletes with physical and visual impairments.',
      adaptadoClassesDesc: 'SH1 and SH2 - Allow individual and team competition.',
      p1Desc: '60 shots in 01:45. Target 170x170mm at 10m. Caliber 4.5mm.',
      p2Desc: '40 shots in 01:15. Target 170x170mm at 10m. Caliber 4.5mm.',
      p3Desc: '60 shots (30 precision + 30 speed). Caliber .22lr.',
      p4Desc: '60 shots in 02:00. Target 500x500mm at 50m. Caliber .22lr.',
      r1r2Desc: 'R1 (M): 60 shots / 01:30. R2 (W): 40 shots / 01:00. Caliber 4.5mm.',
      r3Desc: '60 shots in 01:00. Distance 10m. Caliber 4.5mm.',
      r4Desc: '60 shots in 01:30. Distance 10m. Caliber 4.5mm.',
      r5Desc: '60 shots in 01:10. Distance 10m. Caliber 4.5mm.',
      r6Desc: '60 shots in 01:00. Target 250x250mm at 50m. Caliber .22lr.',
      wftfScenario: 'The Natural Scenario',
      wftfScenarioDesc1: 'It is a sport practiced outdoors that uses natural obstacles and terrain vegetation to create very varied and sometimes unexpected shooting situations.',
      wftfScenarioDesc2: 'Unlike static shooting on a range, in Field Target shooters travel through a natural scenario with several tracks. Each track has metal targets spread randomly at distances between 10 and 50 meters.',
      wftfQuote: '"It is necessary to know how to read the wind and the mirage, as well as have a great familiarity with the ballistics of the weapon."',
      wftfTechnique: 'The Targets and Technique',
      wftfSilhouettes: 'Metal Silhouettes',
      wftfSilhouettesDesc: 'The targets are animal silhouettes (rats, rabbits, birds) with a circular hole (kill zone).',
      wftfPhysics: 'Physics and Optics',
      wftfPhysicsDesc: 'Through the parallax of the telescopic sight, the shooter estimates the distance of the target and adjusts the shot compensation.',
      safety: 'Safety Rules', ranks: 'Categories / Levels', documents: 'Athlete Docs', international: 'Intern. Bodies',
      historyOrigin: 'History and Origin', lema: 'Primordial Motto', ipscPortugal: 'IPSC in Portugal', ipscPortugalDesc: 'Introduced in 1993 by Guilherme Chitas, Paulo Aires, José Pêgo and Fernando Almeida. Only short weapon competitions (minimum caliber 9x19mm) are allowed.', gunpowder: 'Black Powder and History',
      weaponsCategories: 'Weapons and Categories', nationalDisciplines: 'National Disciplines', provasPortugal: 'Trials in Portugal', bulletPrecision: 'Bullet & Precision Trials', ordinanceWeapons: 'Ordnance Weapons',
      searchCenter: 'The Search for the Center', functionalClasses: 'Functional Classes', disciplines: 'Disciplines', distances: 'Distances', duration: 'Duration',
      original: 'Original', replica: 'Replica', grouping: 'Grouping', targetCenter: 'Center Shot',
      intConfed: 'International Confederation', muzzleLoading: 'Muzzle Loading', highPrecision: 'High Precision',
      fedTitle: 'National Competitions', fedNationalDisc: 'National Disciplines',
      fedCarabinaCano: 'Articulated Barrel Rifle', fedCarabinaCanoDesc: 'Simple and attractive: 4.5mm rifle, articulated barrel. 40 shots in 1h, standing position, target at 10m.',
      fedPistola5T: '5-Shot Pistol', fedPistola5TPDesc: 'Precision: 1 practice series + 4 series of 5 shots in 150 sec.', fedPistola5TVDesc: 'Speed: 1 practice series + 4 series of 5 shots in 20 sec.',
      fedPistolaAr: 'Air Pistol', fedPistolaArDesc: 'Regional/national discipline. 40 shots in 1h15 (M/W), target at 10m. Caliber 4.5mm.',
      fedVelocidade: 'Speed', fedVelocidadeDesc: 'Knock down 5 metal targets at 10m in 10s. M: 40 shots / W: 30 shots.',
      fedStandard: 'Standard', fedStandardDesc: 'Series of 5 shots on paper target at 10m in 10s. M: 40 shots / W: 30 shots.',
      fedAr50: 'AR 50', fedAr50Desc: 'Air pistol and rifle. Played in 3 phases: qualification, semifinals and finals for medals.',
      fedEquipasMistas: 'Mixed Teams', fedBalaPrecisao: 'Bullet & Precision Trials',
      fedRecreio25m: 'Short Recreational Weapon at 25m', fedRecreio25mDesc: '30 shots (6 series of 5 t in 5 min). Initiation to .22LR caliber with exclusive focus on precision.',
      fedOrdinance: 'Ordnance Weapons', fedOrdinanceDesc: 'Ordnance Pistol and Revolver at 25m. 30 shots (6 series of 5 t in 5 min). Calibers 7.62mm to 11.6mm.',
      wftfPositions: 'Shooting Positions', wftfPositionsDesc: 'Although most shots are in a free position, natural obstacles force the mastery of various positions.',
      wftfEquip: 'Basic Equipment', wftfWeapons: 'Air Weapons', wftfWeaponsDesc: 'PCP or Spring with power less than 24 Joules.',
      wftfScope: 'Telescopic Sight', wftfScopeDesc: 'Adjustable objective for parallax correction (focus from 10m).'
    },
    general: { pts: 'Points', meters: 'meters', back: 'Back', save: 'Save', cancel: 'Cancel', finish: 'Finish', delete: 'Delete', edit: 'Edit', loading: 'Loading...', continue: 'Continue', pause: 'Pause', enter: 'ENTER', deleteError: 'Error deleting record. Please try again.', avg: 'avg' },
    training: { 
      new: 'New Training', active: 'Active Training', activeCompetition: 'Active Competition', session: 'Session', rounds: 'Series', shots: 'Shots', score: 'Score', target: 'Target', total: 'Total', recommended: 'Recommended Training', training: 'Training',
      seriesOf: 'Series {{current}} of {{total}}', shotOf: 'Shot {{current}}/{{total}}', warmup: 'Warmup', competition: 'Competition', competitionName: 'Competition Name', configWeapon: 'Weapon Config',
      baseConfig: 'Base Config', numSeries: 'Num. of Series', shotsPerSeries: 'Shots per Series', totalShots: 'Total: {{count}} shots', timePerSeries: 'Series Time (sec)', scoreGoal: 'Goal',
      equipmentAmmo: 'Equipment & Ammo', weapon: 'Weapon', caliber: 'Caliber', distance: 'Distance', start: 'Start Training', startCompetition: 'Start Competition', pistol: 'Pistol', rifle: 'Rifle', instructorNotes: 'Instructor Notes',
      waitingShot: 'Waiting for shot', totalShotsOfficial: 'Official Shots', ammoBrand: 'Ammo', weaponModel: 'Weapon (Brand/Model)', targetType: 'Target', customize: 'Customize', time: 'Time',
      schedule: 'Schedule', scheduledEvents: 'Scheduled Events', noEvents: 'No scheduled events', addEvent: 'New Schedule', eventName: 'Event Name', eventDate: 'Date', eventTime: 'Time'
    },
    history: { 
      title: 'History', 
      compare: 'Compare', 
      noData: 'No training recorded yet.', 
      cloud: 'Cloud', 
      exit: 'Exit', 
      details: 'Training Details', 
      detailsCompetition: 'Competition Details',
      editRecord: 'Edit Record',
      editScores: 'Edit Scores & Series',
      editDetails: 'Edit Equipment & Ammo',
      editNotes: 'Edit Notes',
      editDate: 'Edit Date',
      seriesBreakdown: 'Series & Shots',
      addSeries: 'Add Series',
      deleteSeries: 'Delete Series',
      addShot: 'Add Shot',
      deleteShot: 'Remove Shot'
    },
    goals: { deleteConfirm: 'Delete this goal?', deleteTitle: 'Delete Goal', target: 'Target', complete: 'complete', completed: 'COMPLETED', inProgress: 'IN PROGRESS' },
    results: { title: 'Training Completed', titleCompetition: 'Competition Completed', subtitle: 'Good work. Keep practicing.', success: 'Congratulations!', reached: 'Goal Reached!', almost: 'Almost there!', focus: 'Focus and Practice!', totalPoints: 'Total Points', avgShot: 'Avg / Shot', perShot: 'per shot', progress: 'Goal Progress', save: 'Finish & Save', next: 'Next', showResults: 'Show Results', weapon: 'Weapon', distance: 'Distance', series: 'Series', warmup: 'Warmup' },
    compare: { title: 'Comparison', performanceBySeries: 'Performance by Series', series: 'Series', consistency: 'Consistency', analysis: 'Comparative Analysis' }
  }
};

const triggerFeedback = (type: 'click' | 'success' | 'warning' | 'error' = 'click') => {
  const soundEnabled = localStorage.getItem('app-sound') !== 'false';

  // Audio feedback using Web Audio API
  if (soundEnabled) {
    try {
      if (!audioCtx) {
        const AudioContextClass = (window.AudioContext || (window as any).webkitAudioContext);
        if (AudioContextClass) {
          audioCtx = new AudioContextClass();
        }
      }
      
      if (audioCtx && audioCtx.state === 'suspended') {
        audioCtx.resume();
      }

      if (audioCtx) {
        const oscillator = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioCtx.destination);

        const now = audioCtx.currentTime;

        if (type === 'click') {
          oscillator.type = 'sine';
          oscillator.frequency.setValueAtTime(600, now);
          gainNode.gain.setValueAtTime(0.05, now);
          gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
          oscillator.start();
          oscillator.stop(now + 0.1);
        } else if (type === 'success') {
          oscillator.type = 'sine';
          oscillator.frequency.setValueAtTime(800, now);
          oscillator.frequency.exponentialRampToValueAtTime(1200, now + 0.2);
          gainNode.gain.setValueAtTime(0.3, now);
          gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
          oscillator.start();
          oscillator.stop(now + 0.2);
        } else if (type === 'warning') {
          oscillator.type = 'triangle';
          oscillator.frequency.setValueAtTime(300, now);
          gainNode.gain.setValueAtTime(0.05, now);
          gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
          oscillator.start();
          oscillator.stop(now + 0.2);
        } else if (type === 'error') {
          oscillator.type = 'sawtooth';
          oscillator.frequency.setValueAtTime(150, now);
          gainNode.gain.setValueAtTime(0.05, now);
          gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
          oscillator.start();
          oscillator.stop(now + 0.4);
        }
      }
    } catch (e) {
      console.warn('Audio feedback failed:', e);
    }
  }
};

const useTranslation = () => {
    const { language } = useTheme();
    return (path: string, options?: Record<string, string | number>) => {
        const keys = path.split('.');
        let result: any = (translations as any)[language];
        for (const key of keys) {
            result = result?.[key];
        }
        
        let text = result || path;
        if (options && typeof text === 'string') {
            Object.entries(options).forEach(([k, v]) => {
                text = text.replace(`{{${k}}}`, String(v));
            });
        }
        return text;
    };
};

const Button = ({ 
  children, 
  onClick, 
  variant = 'primary', 
  className = '',
  disabled = false,
  icon: Icon
}: { 
  children: React.ReactNode; 
  onClick?: () => void; 
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  className?: string;
  disabled?: boolean;
  icon?: any;
}) => {
  const handleClick = () => {
    if (!disabled) {
      triggerFeedback('click');
      onClick?.();
    }
  };

  const variants = {
    primary: 'btn-primary',
    secondary: 'btn-secondary',
    danger: 'bg-red-500/20 text-red-500 border border-red-500/30 hover:bg-red-500/30',
    ghost: 'bg-transparent text-zinc-400 hover:text-white hover:bg-white/5'
  };

  return (
    <motion.button
      whileTap={{ scale: 0.95 }}
      whileHover={{ scale: 1.01 }}
      onClick={handleClick}
      disabled={disabled}
      className={`flex items-center justify-center gap-2 px-6 py-4 rounded-2xl font-medium transition-all ${variants[variant]} ${className} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      {Icon && <Icon size={20} />}
      {children}
    </motion.button>
  );
};

const Card = ({ children, className = '' }: { children: React.ReactNode; className?: string; key?: React.Key }) => (
  <div className={`glass-card rounded-3xl p-5 ${className}`}>
    {children}
  </div>
);

const GoalItem = ({ goal, onUpdate }: { goal: Goal; onUpdate: () => void }) => {
    const t = useTranslation();
    const percentage = Math.min(100, goal.progress);

    const handleDelete = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        triggerFeedback('warning');
        if (window.confirm(t('goals.deleteConfirm'))) {
            try {
                await goalService.deleteGoal(goal.id || goal.createdAt, goal.createdAt);
                onUpdate();
            } catch (err) {
                console.error("Erro ao eliminar meta:", err);
            }
        }
    };

    return (
        <Card className="mb-4 relative group">
            <button 
                type="button"
                onClick={handleDelete}
                className="absolute top-2 right-2 text-zinc-600 hover:text-red-500 transition-colors opacity-100 sm:opacity-40 sm:group-hover:opacity-100 p-2 z-20"
                title={t('goals.deleteTitle')}
            >
                <Trash2 size={16} />
            </button>
            <div className="flex justify-between items-start mb-3">
                <div>
                    <h4 className="text-zinc-100 font-bold uppercase tracking-tight pr-6">{goal.title}</h4>
                    <p className="text-[10px] text-zinc-500 font-mono">{t('goals.target')}: {goal.targetScore} {t('general.pts')}</p>
                </div>
                {goal.completed && <CheckCircle2 size={16} className="text-[var(--success)]" />}
            </div>
            <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden mb-2">
                <div 
                    className="h-full bg-[var(--accent)] transition-all duration-500" 
                    style={{ width: `${percentage}%` }}
                />
            </div>
            <div className="flex justify-between text-[10px] font-bold font-mono">
                <span className="text-zinc-500">{percentage}% {t('goals.complete')}</span>
                <span className={goal.completed ? 'text-[var(--success)]' : 'text-zinc-400'}>
                    {goal.completed ? t('goals.completed') : t('goals.inProgress')}
                </span>
            </div>
        </Card>
    );
};

import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar
} from 'recharts';
const TrainingDetailScreen = ({ trainingId, onNavigate, initialEdit }: { trainingId: any; onNavigate: (page: string, params?: any) => void; initialEdit?: boolean }) => {
    const t = useTranslation();
    const [training, setTraining] = useState<TrainingSession | null>(null);
    const [loading, setLoading] = useState(true);

    // Editing states
    const [isFullEditModalOpen, setIsFullEditModalOpen] = useState(Boolean(initialEdit));
    const [fullEditTab, setFullEditTab] = useState<'scores' | 'equipment' | 'notes'>('scores');

    // Date editing
    const [isEditingDate, setIsEditingDate] = useState(false);
    const [editedDate, setEditedDate] = useState('');

    // Equipment & details editing
    const [isEditingDetails, setIsEditingDetails] = useState(false);
    const [editedSessionType, setEditedSessionType] = useState<'training' | 'competition'>('training');
    const [editedCompetitionName, setEditedCompetitionName] = useState('');
    const [editedWeaponType, setEditedWeaponType] = useState('Pistola');
    const [editedWeaponModel, setEditedWeaponModel] = useState('');
    const [editedCaliber, setEditedCaliber] = useState('9mm');
    const [editedAmmoBrand, setEditedAmmoBrand] = useState('');
    const [editedDistance, setEditedDistance] = useState('25 metros');
    const [editedTargetType, setEditedTargetType] = useState('Precisão');

    // Scores & series editing
    const [isEditingScores, setIsEditingScores] = useState(false);
    const [editedSeries, setEditedSeries] = useState<TrainingSeries[]>([]);
    const [editedTargetPoints, setEditedTargetPoints] = useState<number>(250);
    const [activeShotKeypad, setActiveShotKeypad] = useState<{ seriesIndex: number; shotIndex: number } | null>(null);

    // Notes editing
    const [isEditingNotes, setIsEditingNotes] = useState(false);
    const [editedNotes, setEditedNotes] = useState('');

    React.useEffect(() => {
        const resolvedId = typeof trainingId === 'object' && trainingId !== null && 'id' in trainingId ? trainingId.id : trainingId;
        if (!resolvedId) {
            setLoading(false);
            return;
        }
        setLoading(true);
        trainingService.getTrainingById(resolvedId).then(data => {
            setTraining(data);
            if (data) {
                setEditedDate(data.date || new Date().toISOString());
                setEditedSessionType(data.sessionType || 'training');
                setEditedCompetitionName(data.competitionName || '');
                setEditedWeaponType(data.weaponType || 'Pistola');
                setEditedWeaponModel(data.weaponModel || '');
                setEditedCaliber(data.caliber || '9mm');
                setEditedAmmoBrand(data.ammoBrand || '');
                setEditedDistance(data.distance || '25 metros');
                setEditedTargetType(data.targetType || 'Precisão');
                setEditedTargetPoints(data.targetPoints || 0);
                setEditedNotes(data.notes || '');
                setEditedSeries(JSON.parse(JSON.stringify(data.series || [])));
                if (initialEdit) {
                    setIsFullEditModalOpen(true);
                }
            }
            setLoading(false);
        }).catch(err => {
            console.error("Error loading training detail:", err);
            setLoading(false);
        });
    }, [trainingId, initialEdit]);

    // Recalculates stats whenever series or targetPoints are modified
    const computeSessionStats = (seriesList: TrainingSeries[], targetPts: number) => {
        const computedSeries = seriesList.map(s => {
            const shots = (s.shots || []).map(v => Math.max(0, Math.min(10, Math.round(Number(v) || 0))));
            const score = shots.reduce((acc, curr) => acc + curr, 0);
            const average = shots.length > 0 ? parseFloat((score / shots.length).toFixed(1)) : 0;
            return {
                ...s,
                shots,
                score,
                average,
                isWarmup: !!s.isWarmup
            };
        });

        const officialSeries = computedSeries.filter(s => !s.isWarmup);
        const totalShots = computedSeries.reduce((acc, s) => acc + s.shots.length, 0);

        let totalScore = 0;
        let officialShots = 0;
        let averageScore = 0;
        let numSeries = 0;

        if (officialSeries.length > 0) {
            totalScore = officialSeries.reduce((acc, s) => acc + s.score, 0);
            officialShots = officialSeries.reduce((acc, s) => acc + s.shots.length, 0);
            averageScore = officialShots > 0 ? parseFloat((totalScore / officialShots).toFixed(1)) : 0;
            numSeries = officialSeries.length;
        } else {
            totalScore = computedSeries.reduce((acc, s) => acc + s.score, 0);
            officialShots = 0;
            averageScore = totalShots > 0 ? parseFloat((totalScore / totalShots).toFixed(1)) : 0;
            numSeries = computedSeries.length;
        }

        const shotsPerSeries = computedSeries[0]?.shots?.length || 5;

        return {
            computedSeries,
            totalScore,
            officialShots,
            totalShots,
            averageScore,
            numSeries,
            shotsPerSeries,
            targetPoints: Math.max(0, Number(targetPts) || 0)
        };
    };

    // Handlers for Date
    const handleSaveDate = async () => {
        if (!training || !editedDate) return;
        const updatedTraining = { ...training, date: editedDate };
        const saved = await trainingService.updateTraining(trainingId, updatedTraining);
        setTraining(saved);
        setIsEditingDate(false);
        triggerFeedback('success');
    };

    // Handlers for Equipment Details
    const handleStartEditingDetails = () => {
        if (!training) return;
        setEditedSessionType(training.sessionType || 'training');
        setEditedCompetitionName(training.competitionName || '');
        setEditedWeaponType(training.weaponType || 'Pistola');
        setEditedWeaponModel(training.weaponModel || '');
        setEditedCaliber(training.caliber || '9mm');
        setEditedAmmoBrand(training.ammoBrand || '');
        setEditedDistance(training.distance || '25 metros');
        setEditedTargetType(training.targetType || 'Precisão');
        setIsEditingDetails(true);
    };

    const handleSaveDetails = async () => {
        if (!training) return;
        const updatedTraining: TrainingSession = { 
            ...training, 
            sessionType: editedSessionType,
            competitionName: editedSessionType === 'competition' ? editedCompetitionName : '',
            weaponType: editedWeaponType,
            weaponModel: editedWeaponModel,
            caliber: editedCaliber,
            ammoBrand: editedAmmoBrand,
            distance: editedDistance,
            targetType: editedTargetType
        };
        const saved = await trainingService.updateTraining(trainingId, updatedTraining);
        setTraining(saved);
        setIsEditingDetails(false);
        triggerFeedback('success');
    };

    // Handlers for Scores & Series
    const handleStartEditingScores = () => {
        if (!training) return;
        setEditedSeries(JSON.parse(JSON.stringify(training.series || [])));
        setEditedTargetPoints(training.targetPoints || 0);
        setIsEditingScores(true);
        setActiveShotKeypad(null);
    };

    const handleShotValueChange = (seriesIdx: number, shotIdx: number, val: number) => {
        const next = [...editedSeries];
        if (!next[seriesIdx]) return;
        const shots = [...next[seriesIdx].shots];
        shots[shotIdx] = Math.max(0, Math.min(10, val));
        const score = shots.reduce((a, b) => a + b, 0);
        const average = shots.length > 0 ? parseFloat((score / shots.length).toFixed(1)) : 0;
        next[seriesIdx] = { ...next[seriesIdx], shots, score, average };
        setEditedSeries(next);
    };

    const handleAddShotToSeries = (seriesIdx: number) => {
        const next = [...editedSeries];
        if (!next[seriesIdx]) return;
        const shots = [...next[seriesIdx].shots, 10];
        const score = shots.reduce((a, b) => a + b, 0);
        const average = shots.length > 0 ? parseFloat((score / shots.length).toFixed(1)) : 0;
        next[seriesIdx] = { ...next[seriesIdx], shots, score, average };
        setEditedSeries(next);
        triggerFeedback('click');
    };

    const handleRemoveShotFromSeries = (seriesIdx: number, shotIdx?: number) => {
        const next = [...editedSeries];
        if (!next[seriesIdx] || next[seriesIdx].shots.length === 0) return;
        const shots = [...next[seriesIdx].shots];
        if (typeof shotIdx === 'number') {
            shots.splice(shotIdx, 1);
        } else {
            shots.pop();
        }
        const score = shots.reduce((a, b) => a + b, 0);
        const average = shots.length > 0 ? parseFloat((score / shots.length).toFixed(1)) : 0;
        next[seriesIdx] = { ...next[seriesIdx], shots, score, average };
        setEditedSeries(next);
        setActiveShotKeypad(null);
        triggerFeedback('click');
    };

    const handleToggleSeriesWarmup = (seriesIdx: number) => {
        const next = [...editedSeries];
        if (!next[seriesIdx]) return;
        next[seriesIdx] = { ...next[seriesIdx], isWarmup: !next[seriesIdx].isWarmup };
        setEditedSeries(next);
        triggerFeedback('click');
    };

    const handleAddNewSeries = () => {
        const defaultShotsCount = editedSeries[0]?.shots?.length || 5;
        const newShots = Array(defaultShotsCount).fill(10);
        const newSeriesItem: TrainingSeries = {
            shots: newShots,
            score: newShots.reduce((a, b) => a + b, 0),
            average: 10,
            isWarmup: false
        };
        setEditedSeries([...editedSeries, newSeriesItem]);
        triggerFeedback('click');
    };

    const handleRemoveSeries = (seriesIdx: number) => {
        if (editedSeries.length <= 1) return;
        const next = editedSeries.filter((_, i) => i !== seriesIdx);
        setEditedSeries(next);
        setActiveShotKeypad(null);
        triggerFeedback('click');
    };

    const handleSaveScores = async () => {
        if (!training) return;
        const stats = computeSessionStats(editedSeries, editedTargetPoints);
        const updatedTraining: TrainingSession = {
            ...training,
            series: stats.computedSeries,
            totalScore: stats.totalScore,
            officialShots: stats.officialShots,
            totalShots: stats.totalShots,
            averageScore: stats.averageScore,
            numSeries: stats.numSeries,
            shotsPerSeries: stats.shotsPerSeries,
            targetPoints: stats.targetPoints
        };
        const saved = await trainingService.updateTraining(trainingId, updatedTraining);
        setTraining(saved);
        setIsEditingScores(false);
        setActiveShotKeypad(null);
        triggerFeedback('success');
    };

    // Handlers for Notes
    const handleStartEditingNotes = () => {
        if (!training) return;
        setEditedNotes(training.notes || '');
        setIsEditingNotes(true);
    };

    const handleSaveNotes = async () => {
        if (!training) return;
        const updatedTraining = { ...training, notes: editedNotes };
        const saved = await trainingService.updateTraining(trainingId, updatedTraining);
        setTraining(saved);
        setIsEditingNotes(false);
        triggerFeedback('success');
    };

    // Handlers for Full Edit Modal
    const handleOpenFullEdit = () => {
        if (!training) return;
        setEditedDate(training.date || new Date().toISOString());
        setEditedSessionType(training.sessionType || 'training');
        setEditedCompetitionName(training.competitionName || '');
        setEditedWeaponType(training.weaponType || 'Pistola');
        setEditedWeaponModel(training.weaponModel || '');
        setEditedCaliber(training.caliber || '9mm');
        setEditedAmmoBrand(training.ammoBrand || '');
        setEditedDistance(training.distance || '25 metros');
        setEditedTargetType(training.targetType || 'Precisão');
        setEditedTargetPoints(training.targetPoints || 0);
        setEditedNotes(training.notes || '');
        setEditedSeries(JSON.parse(JSON.stringify(training.series || [])));
        setActiveShotKeypad(null);
        setIsFullEditModalOpen(true);
    };

    const handleSaveFullEdit = async () => {
        if (!training) return;
        const stats = computeSessionStats(editedSeries, editedTargetPoints);
        const updatedTraining: TrainingSession = {
            ...training,
            date: editedDate,
            sessionType: editedSessionType,
            competitionName: editedSessionType === 'competition' ? editedCompetitionName : '',
            weaponType: editedWeaponType,
            weaponModel: editedWeaponModel,
            caliber: editedCaliber,
            ammoBrand: editedAmmoBrand,
            distance: editedDistance,
            targetType: editedTargetType,
            notes: editedNotes,
            series: stats.computedSeries,
            totalScore: stats.totalScore,
            officialShots: stats.officialShots,
            totalShots: stats.totalShots,
            averageScore: stats.averageScore,
            numSeries: stats.numSeries,
            shotsPerSeries: stats.shotsPerSeries,
            targetPoints: stats.targetPoints
        };
        const saved = await trainingService.updateTraining(trainingId, updatedTraining);
        setTraining(saved);
        setIsFullEditModalOpen(false);
        setIsEditingScores(false);
        setIsEditingDetails(false);
        setIsEditingDate(false);
        setIsEditingNotes(false);
        setActiveShotKeypad(null);
        triggerFeedback('success');
    };

    const generateInstructorNote = (session: TrainingSession) => {
        if (session.notes && session.notes.trim().length > 0) return session.notes;

        const target = session.targetPoints || 250;
        const ratio = target > 0 ? session.totalScore / target : 1;
        const avg = session.averageScore;

        if (session.totalScore >= target && target > 0) {
            if (avg >= 9.5) return t('results.success');
            if (avg >= 9.0) return t('results.reached');
            return t('results.success');
        }

        if (ratio >= 0.90) return t('results.almost');
        return t('results.focus');
    };

    if (loading) return (
        <div className="p-3 pb-40">
            <Header title={t('history.details') || 'Detalhes'} onBack={() => onNavigate('history')} />
            <div className="flex flex-col items-center justify-center p-16 space-y-4">
                <div className="w-8 h-8 border-4 border-[var(--accent)] border-t-transparent rounded-full animate-spin" />
                <p className="text-xs text-zinc-500 font-mono">A carregar registo...</p>
            </div>
        </div>
    );

    if (!training) return (
        <div className="p-3 pb-40">
            <Header title={t('history.details') || 'Detalhes'} onBack={() => onNavigate('history')} />
            <div className="p-8 text-center bg-[var(--card-bg)] rounded-3xl border border-[var(--border-color)] my-4 space-y-4">
                <div className="w-12 h-12 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center mx-auto">
                    <AlertCircle size={24} />
                </div>
                <div>
                    <h3 className="text-base font-bold text-white mb-1">Registo não encontrado</h3>
                    <p className="text-xs text-zinc-400">O treino ou prova selecionado não foi encontrado no histórico local.</p>
                </div>
                <button
                    onClick={() => onNavigate('history')}
                    className="px-4 py-2 rounded-xl bg-[var(--accent)] text-white text-xs font-bold uppercase tracking-wider hover:opacity-90 transition-opacity"
                >
                    Voltar ao Histórico
                </button>
            </div>
        </div>
    );

    const chartData = training.series.map((s, i) => ({
        name: s.isWarmup ? 'A' : `S${training.series.slice(0, i).filter(prev => !prev.isWarmup).length + 1}`,
        pontos: s.score,
        media: s.average,
        label: t('compare.series') + ' ' + (s.isWarmup ? 'A' : `S${training.series.slice(0, i).filter(prev => !prev.isWarmup).length + 1}`)
    }));

    const shotData = training.series.flatMap((s, si) => {
        const seriesName = s.isWarmup ? 'A' : (t('compare.series').substring(0, 1) + (training.series.slice(0, si).filter(prev => !prev.isWarmup).length + 1));
        return (s.shots || []).map((p, pi) => ({
            name: `${seriesName}-${t('training.shots').substring(0, 1)}${pi+1}`,
            valor: p
        }));
    });

    const liveStats = computeSessionStats(editedSeries, editedTargetPoints);

    return (
        <div className="p-3 pb-40">
            <Header 
                title={training.sessionType === 'competition' ? t('history.detailsCompetition') : t('history.details')} 
                onBack={() => onNavigate('history')} 
                rightElement={
                    <button 
                        onClick={() => { triggerFeedback('click'); handleOpenFullEdit(); }}
                        className="px-3 py-1.5 rounded-xl bg-[var(--accent)] text-white text-xs font-black uppercase tracking-wider flex items-center gap-1.5 shadow-sm hover:opacity-90 active:scale-95 transition-all"
                    >
                        <Edit2 size={13} />
                        <span>{t('history.editRecord') || 'Editar Registo'}</span>
                    </button>
                }
            />
            
            {/* Date Header Row */}
            <div className="px-1 flex justify-between items-center mb-4">
                <div className="flex items-center gap-2">
                    <Calendar size={14} className="text-zinc-500" />
                    {isEditingDate ? (
                        <input 
                            type="date" 
                            value={editedDate.split('T')[0]} 
                            onChange={(e) => setEditedDate(e.target.value)}
                            className="bg-black/40 border border-[var(--accent)] rounded-lg px-2 py-1 text-xs font-mono text-[var(--accent)] outline-none"
                        />
                    ) : (
                        <span className="text-xs font-bold font-mono text-zinc-400 uppercase">
                            {new Date(training.date).toLocaleDateString()}
                        </span>
                    )}
                </div>
                {isEditingDate ? (
                    <div className="flex gap-1">
                        <button onClick={() => setIsEditingDate(false)} className="p-1.5 text-zinc-400 hover:text-red-500 transition-colors">
                            <X size={16} />
                        </button>
                        <button onClick={handleSaveDate} className="p-1.5 text-[var(--accent)] hover:scale-110 transition-transform">
                            <Check size={16} />
                        </button>
                    </div>
                ) : (
                    <button 
                        onClick={() => { triggerFeedback('click'); setIsEditingDate(true); }} 
                        className="p-1.5 text-zinc-500 hover:text-[var(--accent)] transition-colors"
                        title={t('history.editDate') || 'Editar Data'}
                    >
                        <Edit2 size={14} />
                    </button>
                )}
            </div>

            <div className="space-y-6">
                {/* Competition Banner */}
                {training.sessionType === 'competition' && training.competitionName && (
                  <div className="flex justify-between items-center px-1">
                    <span className="text-xl font-black uppercase text-amber-500 tracking-tighter">{training.competitionName}</span>
                    <div className="px-2 py-0.5 rounded-full border bg-amber-500/10 border-amber-500/20 text-amber-500 text-[10px] font-black uppercase tracking-tighter">
                         {t('training.competition')}
                    </div>
                  </div>
                )}

                {/* Performance Consistency Chart */}
                <Card>
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <p className="text-[10px] text-zinc-500 font-bold uppercase font-mono">{t('compare.performanceBySeries')}</p>
                            <h3 className="text-xl font-black">{t('compare.consistency')}</h3>
                        </div>
                        <div className="text-right">
                             <span className="text-2xl font-mono font-bold text-[var(--accent)]">{training.totalScore} {t('general.pts')}</span>
                             <span className="text-[10px] text-zinc-500 block uppercase">{t('training.total')}</span>
                             {training.targetPoints > 0 && (
                                <div className="mt-1 flex flex-col items-end">
                                    <span className="text-[9px] text-zinc-500 uppercase font-bold">{t('training.scoreGoal')}</span>
                                    <span className="text-sm font-mono font-bold text-zinc-400">{training.targetPoints} {t('general.pts')}</span>
                                </div>
                             )}
                        </div>
                    </div>
                    <div className="h-48 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#222" />
                                <XAxis dataKey="name" stroke="#555" fontSize={10} />
                                <YAxis stroke="#555" fontSize={10} domain={[0, 50]} />
                                <Tooltip 
                                    contentStyle={{ backgroundColor: '#111', border: '1px solid #333', borderRadius: '8px' }}
                                    itemStyle={{ color: 'var(--accent)' }}
                                />
                                <Line type="monotone" dataKey="pontos" stroke="var(--accent)" strokeWidth={3} dot={{ r: 4, fill: 'var(--accent)' }} activeDot={{ r: 6 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </Card>

                {/* Shots Bar Chart */}
                <Card>
                    <p className="text-[10px] text-zinc-500 font-bold uppercase font-mono mb-4">{t('home.totalShots')}</p>
                    <div className="h-48 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={shotData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#222" />
                                <XAxis dataKey="name" stroke="#555" fontSize={8} hide />
                                <YAxis stroke="#555" fontSize={10} domain={[0, 10]} />
                                <Tooltip 
                                    contentStyle={{ backgroundColor: '#111', border: '1px solid #333', borderRadius: '8px' }}
                                />
                                <Bar dataKey="valor" fill="var(--accent)" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </Card>

                {/* Summary Metrics */}
                <div className="grid grid-cols-2 gap-4">
                    <Card className="p-4 flex flex-col items-center">
                        <span className="text-[10px] text-zinc-500 uppercase font-bold mb-1">{t('results.avgShot')}</span>
                        <span className="text-3xl font-mono font-bold text-[var(--accent)]">{training.averageScore}</span>
                        <span className="text-[10px] text-zinc-600 mt-1">{t('results.perShot')}</span>
                    </Card>
                    <Card className="p-4 flex flex-col items-center">
                        <span className="text-[10px] text-zinc-500 uppercase font-bold mb-1">{t('home.bestShot')}</span>
                        <span className="text-3xl font-mono font-bold">
                            {training.series.flatMap(s => s.shots || []).length > 0 ? Math.max(...training.series.flatMap(s => s.shots || [])) : 0}
                        </span>
                    </Card>
                </div>

                {/* Series & Shots Breakdown Card with In-Place Editing */}
                <Card className="p-4 space-y-4">
                    <div className="flex justify-between items-center">
                        <div>
                            <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest">{t('history.seriesBreakdown') || 'Séries & Disparos'}</span>
                            <p className="text-xs text-zinc-400">{training.series.length} {t('results.series')} · {training.totalScore} {t('general.pts')}</p>
                        </div>
                        {isEditingScores ? (
                            <div className="flex gap-2">
                                <button onClick={() => { setIsEditingScores(false); setActiveShotKeypad(null); }} className="px-2.5 py-1 text-xs text-zinc-400 hover:text-white bg-zinc-800 rounded-lg">
                                    {t('general.cancel') || 'Cancelar'}
                                </button>
                                <button onClick={handleSaveScores} className="px-2.5 py-1 text-xs text-white bg-[var(--accent)] hover:opacity-90 rounded-lg font-bold">
                                    {t('general.save') || 'Guardar'}
                                </button>
                            </div>
                        ) : (
                            <button 
                                onClick={() => { triggerFeedback('click'); handleStartEditingScores(); }} 
                                className="p-1.5 text-zinc-400 hover:text-[var(--accent)] transition-colors flex items-center gap-1 text-xs font-bold"
                            >
                                <Edit2 size={14} />
                                <span>{t('history.editScores') || 'Editar Pontos'}</span>
                            </button>
                        )}
                    </div>

                    {isEditingScores ? (
                        <div className="space-y-4 pt-2">
                            {/* Target points input */}
                            <div className="bg-black/30 p-3 rounded-2xl border border-[var(--border-color)]">
                                <label className="block text-[10px] text-zinc-500 uppercase font-bold mb-1">{t('training.scoreGoal') || 'Meta de Pontos'}</label>
                                <input 
                                    type="number"
                                    value={editedTargetPoints || ''}
                                    onChange={(e) => setEditedTargetPoints(Number(e.target.value))}
                                    placeholder="Ex: 250"
                                    className="w-full bg-black/40 border border-[var(--border-color)] rounded-xl px-3 py-2 text-xs font-mono font-bold text-white outline-none focus:border-[var(--accent)]"
                                />
                            </div>

                            {/* Series items editor */}
                            <div className="space-y-3">
                                {editedSeries.map((s_item, s_idx) => {
                                    const s_num = editedSeries.slice(0, s_idx).filter(prev => !prev.isWarmup).length + 1;
                                    return (
                                        <div key={s_idx} className={`p-3 rounded-2xl border ${s_item.isWarmup ? 'bg-purple-950/20 border-purple-500/30' : 'bg-black/40 border-[var(--border-color)]'} space-y-2`}>
                                            <div className="flex justify-between items-center">
                                                <div className="flex items-center gap-2">
                                                    <span className={`text-xs font-black uppercase ${s_item.isWarmup ? 'text-purple-400' : 'text-zinc-200'}`}>
                                                        {s_item.isWarmup ? t('training.warmup') : `${t('compare.series')} ${s_num}`}
                                                    </span>
                                                    <button 
                                                        type="button"
                                                        onClick={() => handleToggleSeriesWarmup(s_idx)}
                                                        className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase border transition-colors ${s_item.isWarmup ? 'bg-purple-500 text-white border-purple-400' : 'bg-zinc-800 text-zinc-400 border-zinc-700 hover:text-white'}`}
                                                    >
                                                        {s_item.isWarmup ? 'Aquecimento Ativo' : 'Tornar Aquecimento'}
                                                    </button>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <span className="text-xs font-mono font-bold text-[var(--accent)]">
                                                        {s_item.score} pts ({s_item.average} avg)
                                                    </span>
                                                    {editedSeries.length > 1 && (
                                                        <button 
                                                            type="button"
                                                            onClick={() => handleRemoveSeries(s_idx)}
                                                            className="text-zinc-600 hover:text-red-500 transition-colors p-1"
                                                            title={t('history.deleteSeries')}
                                                        >
                                                            <Trash2 size={14} />
                                                        </button>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Shots Bubbles Row */}
                                            <div className="flex flex-wrap gap-2 items-center pt-1">
                                                {(s_item.shots || []).map((shotVal, shotIdx) => {
                                                    const isSelected = activeShotKeypad?.seriesIndex === s_idx && activeShotKeypad?.shotIndex === shotIdx;
                                                    return (
                                                        <div key={shotIdx} className="relative">
                                                            <button
                                                                type="button"
                                                                onClick={() => {
                                                                    triggerFeedback('click');
                                                                    setActiveShotKeypad(isSelected ? null : { seriesIndex: s_idx, shotIndex: shotIdx });
                                                                }}
                                                                className={`w-9 h-9 rounded-xl font-mono text-sm font-bold flex items-center justify-center border transition-all ${
                                                                    isSelected 
                                                                        ? 'border-[var(--accent)] bg-[var(--accent)] text-white scale-105 shadow-[0_0_10px_var(--accent-glow)]' 
                                                                        : shotVal === 10 
                                                                            ? 'border-amber-500/40 bg-amber-500/10 text-amber-400' 
                                                                            : shotVal >= 8 
                                                                                ? 'border-[var(--accent)]/30 bg-[var(--accent)]/10 text-[var(--accent)]' 
                                                                                : 'border-zinc-700 bg-zinc-800 text-zinc-300'
                                                                }`}
                                                            >
                                                                {shotVal}
                                                            </button>
                                                        </div>
                                                    );
                                                })}
                                                <button
                                                    type="button"
                                                    onClick={() => handleAddShotToSeries(s_idx)}
                                                    className="w-8 h-8 rounded-xl border border-dashed border-zinc-700 text-zinc-400 hover:text-white hover:border-[var(--accent)] flex items-center justify-center text-xs transition-colors"
                                                    title={t('history.addShot')}
                                                >
                                                    <Plus size={14} />
                                                </button>
                                                {s_item.shots.length > 1 && (
                                                    <button
                                                        type="button"
                                                        onClick={() => handleRemoveShotFromSeries(s_idx)}
                                                        className="px-2 h-8 rounded-xl border border-zinc-800 text-[10px] text-zinc-500 hover:text-red-400 transition-colors flex items-center gap-0.5 font-mono"
                                                        title={t('history.deleteShot')}
                                                    >
                                                        <X size={12} />
                                                    </button>
                                                )}
                                            </div>

                                            {/* Quick Keypad Popup for selected shot */}
                                            {activeShotKeypad?.seriesIndex === s_idx && (
                                                <div className="mt-2 p-2 bg-zinc-900 border border-[var(--accent)]/40 rounded-2xl shadow-xl space-y-2">
                                                    <div className="flex justify-between items-center px-1">
                                                        <span className="text-[10px] font-bold text-zinc-400 uppercase">
                                                            Disparo #{activeShotKeypad.shotIndex + 1}
                                                        </span>
                                                        <button 
                                                            onClick={() => setActiveShotKeypad(null)} 
                                                            className="text-zinc-500 hover:text-white text-xs"
                                                        >
                                                            <X size={14} />
                                                        </button>
                                                    </div>
                                                    <div className="grid grid-cols-6 gap-1.5">
                                                        {[10, 9, 8, 7, 6, 5, 4, 3, 2, 1, 0].map((val) => (
                                                            <button
                                                                key={val}
                                                                type="button"
                                                                onClick={() => {
                                                                    handleShotValueChange(s_idx, activeShotKeypad.shotIndex, val);
                                                                    triggerFeedback('click');
                                                                    // auto advance to next shot if available
                                                                    if (activeShotKeypad.shotIndex + 1 < s_item.shots.length) {
                                                                        setActiveShotKeypad({ seriesIndex: s_idx, shotIndex: activeShotKeypad.shotIndex + 1 });
                                                                    } else {
                                                                        setActiveShotKeypad(null);
                                                                    }
                                                                }}
                                                                className={`h-8 rounded-lg font-mono font-bold text-xs flex items-center justify-center border transition-all ${
                                                                    s_item.shots[activeShotKeypad.shotIndex] === val
                                                                        ? 'bg-[var(--accent)] text-white border-[var(--accent)]'
                                                                        : val === 10
                                                                            ? 'bg-amber-500/20 text-amber-400 border-amber-500/30 hover:bg-amber-500/30'
                                                                            : 'bg-zinc-800 text-zinc-200 border-zinc-700 hover:bg-zinc-700'
                                                                }`}
                                                            >
                                                                {val}
                                                            </button>
                                                        ))}
                                                        <button
                                                            type="button"
                                                            onClick={() => handleRemoveShotFromSeries(s_idx, activeShotKeypad.shotIndex)}
                                                            className="h-8 rounded-lg font-bold text-xs flex items-center justify-center border bg-red-500/10 text-red-400 border-red-500/20 hover:bg-red-500/20"
                                                            title="Eliminar este disparo"
                                                        >
                                                            <Trash2 size={12} />
                                                        </button>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Add series button */}
                            <button
                                type="button"
                                onClick={handleAddNewSeries}
                                className="w-full py-2.5 rounded-xl border border-dashed border-zinc-700 hover:border-[var(--accent)] text-xs text-zinc-400 hover:text-white flex items-center justify-center gap-1.5 font-bold transition-colors"
                            >
                                <Plus size={14} />
                                <span>{t('history.addSeries') || 'Adicionar Nova Série'}</span>
                            </button>

                            {/* Live recalculated summary */}
                            <div className="p-3 bg-zinc-900/80 rounded-2xl border border-zinc-800 flex justify-between items-center text-xs">
                                <div>
                                    <span className="text-[10px] text-zinc-500 uppercase font-bold block">Novo Total Oficial</span>
                                    <span className="font-mono font-bold text-base text-[var(--accent)]">{liveStats.totalScore} {t('general.pts')}</span>
                                </div>
                                <div className="text-right">
                                    <span className="text-[10px] text-zinc-500 uppercase font-bold block">Média / Disparos</span>
                                    <span className="font-mono font-bold text-zinc-300">{liveStats.averageScore} avg · {liveStats.totalShots} tiros</span>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-3 pt-1">
                            {training.series.map((s, idx) => {
                                const s_num = training.series.slice(0, idx).filter(prev => !prev.isWarmup).length + 1;
                                return (
                                    <div key={idx} className={`p-3 rounded-2xl border ${s.isWarmup ? 'bg-purple-950/10 border-purple-500/20' : 'bg-black/30 border-[var(--border-color)]'}`}>
                                        <div className="flex justify-between items-center mb-2">
                                            <div className="flex items-center gap-2">
                                                <span className={`text-xs font-black uppercase ${s.isWarmup ? 'text-purple-400' : 'text-zinc-200'}`}>
                                                    {s.isWarmup ? t('training.warmup') : `${t('compare.series')} ${s_num}`}
                                                </span>
                                                {s.isWarmup && (
                                                    <span className="text-[9px] px-1.5 py-0.2 bg-purple-500/20 text-purple-400 rounded-full font-bold uppercase">
                                                        Ensaio
                                                    </span>
                                                )}
                                            </div>
                                            <span className="text-xs font-mono font-bold text-[var(--accent)]">
                                                {s.score} pts <span className="text-zinc-500 font-normal">({s.average} avg)</span>
                                            </span>
                                        </div>
                                        <div className="flex flex-wrap gap-1.5">
                                            {(s.shots || []).map((val, shotIdx) => (
                                                <span 
                                                    key={shotIdx}
                                                    className={`w-7 h-7 rounded-lg font-mono text-xs font-bold flex items-center justify-center border ${
                                                        val === 10 
                                                            ? 'border-amber-500/40 bg-amber-500/10 text-amber-400' 
                                                            : val >= 8 
                                                                ? 'border-[var(--accent)]/30 bg-[var(--accent)]/10 text-[var(--accent)]' 
                                                                : 'border-zinc-800 bg-zinc-900 text-zinc-400'
                                                    }`}
                                                >
                                                    {val}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </Card>

                {/* Equipment & Ammunition Card */}
                <Card className="p-4 space-y-4">
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest">{t('training.equipmentAmmo') || 'Equipamento & Munição'}</span>
                        {isEditingDetails ? (
                            <div className="flex gap-2">
                                <button onClick={() => setIsEditingDetails(false)} className="px-2.5 py-1 text-xs text-zinc-400 hover:text-white bg-zinc-800 rounded-lg">
                                    {t('general.cancel') || 'Cancelar'}
                                </button>
                                <button onClick={handleSaveDetails} className="px-2.5 py-1 text-xs text-white bg-[var(--accent)] hover:opacity-90 rounded-lg font-bold">
                                    {t('general.save') || 'Guardar'}
                                </button>
                            </div>
                        ) : (
                            <button onClick={() => { triggerFeedback('click'); handleStartEditingDetails(); }} className="p-1.5 text-zinc-400 hover:text-[var(--accent)] transition-colors flex items-center gap-1 text-xs font-bold">
                                <Edit2 size={14} />
                                <span>{t('history.editDetails') || 'Editar'}</span>
                            </button>
                        )}
                    </div>

                    {isEditingDetails ? (
                        <div className="space-y-3 pt-2">
                            {/* Session Type */}
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-[10px] text-zinc-500 uppercase font-bold mb-1">Tipo de Sessão</label>
                                    <select 
                                        value={editedSessionType}
                                        onChange={(e) => setEditedSessionType(e.target.value as any)}
                                        className="w-full bg-black/40 border border-[var(--border-color)] rounded-xl px-3 py-2 text-xs font-medium text-white outline-none focus:border-[var(--accent)]"
                                    >
                                        <option value="training">{t('training.training') || 'Treino'}</option>
                                        <option value="competition">{t('training.competition') || 'Prova'}</option>
                                    </select>
                                </div>
                                {editedSessionType === 'competition' && (
                                    <div>
                                        <label className="block text-[10px] text-zinc-500 uppercase font-bold mb-1">Nome da Prova</label>
                                        <input 
                                            type="text" 
                                            value={editedCompetitionName} 
                                            onChange={(e) => setEditedCompetitionName(e.target.value)}
                                            placeholder="Ex: Taça de Portugal"
                                            className="w-full bg-black/40 border border-[var(--border-color)] rounded-xl px-3 py-2 text-xs font-medium text-white outline-none focus:border-[var(--accent)]"
                                        />
                                    </div>
                                )}
                            </div>

                            {/* Weapon & Model */}
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-[10px] text-zinc-500 uppercase font-bold mb-1">{t('results.weapon') || 'Tipo de Arma'}</label>
                                    <select 
                                        value={editedWeaponType}
                                        onChange={(e) => setEditedWeaponType(e.target.value)}
                                        className="w-full bg-black/40 border border-[var(--border-color)] rounded-xl px-3 py-2 text-xs font-medium text-white outline-none focus:border-[var(--accent)]"
                                    >
                                        <option value="Pistola">{t('training.pistol') || 'Pistola'}</option>
                                        <option value="Carabina">{t('training.rifle') || 'Carabina'}</option>
                                        <option value="Outra">Outra</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-[10px] text-zinc-500 uppercase font-bold mb-1">Modelo / Marca</label>
                                    <input 
                                        type="text" 
                                        value={editedWeaponModel} 
                                        onChange={(e) => setEditedWeaponModel(e.target.value)}
                                        placeholder="Ex: Glock 17, CZ Shadow 2"
                                        className="w-full bg-black/40 border border-[var(--border-color)] rounded-xl px-3 py-2 text-xs font-medium text-white outline-none focus:border-[var(--accent)]"
                                    />
                                </div>
                            </div>

                            {/* Caliber & Ammo Brand */}
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-[10px] text-zinc-500 uppercase font-bold mb-1">{t('training.caliber') || 'Calibre'}</label>
                                    <input 
                                        type="text" 
                                        value={editedCaliber} 
                                        onChange={(e) => setEditedCaliber(e.target.value)}
                                        placeholder="Ex: 9mm, .22LR, 4.5mm"
                                        className="w-full bg-black/40 border border-[var(--border-color)] rounded-xl px-3 py-2 text-xs font-medium text-white outline-none focus:border-[var(--accent)]"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] text-zinc-500 uppercase font-bold mb-1">{t('training.ammoBrand') || 'Marca da Munição'}</label>
                                    <input 
                                        type="text" 
                                        value={editedAmmoBrand} 
                                        onChange={(e) => setEditedAmmoBrand(e.target.value)}
                                        placeholder="Ex: GECO, Fiocchi, RWS"
                                        className="w-full bg-black/40 border border-[var(--border-color)] rounded-xl px-3 py-2 text-xs font-medium text-white outline-none focus:border-[var(--accent)]"
                                    />
                                </div>
                            </div>

                            {/* Distance & Target Type */}
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-[10px] text-zinc-500 uppercase font-bold mb-1">{t('results.distance') || 'Distância'}</label>
                                    <input 
                                        type="text" 
                                        value={editedDistance} 
                                        onChange={(e) => setEditedDistance(e.target.value)}
                                        placeholder="Ex: 10 metros, 25 metros"
                                        className="w-full bg-black/40 border border-[var(--border-color)] rounded-xl px-3 py-2 text-xs font-medium text-white outline-none focus:border-[var(--accent)]"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] text-zinc-500 uppercase font-bold mb-1">{t('training.targetType') || 'Tipo de Alvo'}</label>
                                    <input 
                                        type="text" 
                                        value={editedTargetType} 
                                        onChange={(e) => setEditedTargetType(e.target.value)}
                                        placeholder="Ex: Precisão, Duelo, C10"
                                        className="w-full bg-black/40 border border-[var(--border-color)] rounded-xl px-3 py-2 text-xs font-medium text-white outline-none focus:border-[var(--accent)]"
                                    />
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 gap-y-4 gap-x-2">
                            <div>
                                <p className="text-[10px] text-zinc-500 uppercase font-bold">{t('results.weapon')}</p>
                                <p className="text-sm font-medium">
                                    {training.weaponType === 'Pistola' ? t('training.pistol') : (training.weaponType === 'Carabina' ? t('training.rifle') : training.weaponType)}
                                    {training.weaponModel && <span className="block text-[10px] text-[var(--accent)] font-bold mt-0.5">{training.weaponModel}</span>}
                                </p>
                            </div>
                            <div>
                                <p className="text-[10px] text-zinc-500 uppercase font-bold">{t('training.caliber')}</p>
                                <p className="text-sm font-medium">{training.caliber}</p>
                            </div>
                            <div>
                                <p className="text-[10px] text-zinc-500 uppercase font-bold">{t('results.distance')}</p>
                                <p className="text-sm font-medium">{training.distance?.replace('metros', t('general.meters'))}</p>
                            </div>
                            <div>
                                <p className="text-[10px] text-zinc-500 uppercase font-bold">{t('training.targetType')}</p>
                                <p className="text-sm font-medium">{training.targetType}</p>
                            </div>
                            {training.ammoBrand && (
                                <div className="col-span-1">
                                    <p className="text-[10px] text-zinc-500 uppercase font-bold">{t('training.ammoBrand')}</p>
                                    <p className="text-sm font-medium">{training.ammoBrand}</p>
                                </div>
                            )}
                            <div>
                                <p className="text-[10px] text-zinc-500 uppercase font-bold">{t('training.numSeries')}</p>
                                <p className="text-sm font-medium">{training.numSeries || training.series.filter(s => !s.isWarmup).length} {t('results.series')} ({training.totalShots} {t('training.shots')})</p>
                            </div>
                        </div>
                    )}
                </Card>

                {/* Notes & Comments Card */}
                <Card className="p-4 space-y-3">
                    <div className="flex justify-between items-center">
                        <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest">{t('training.instructorNotes')}</span>
                        {isEditingNotes ? (
                            <div className="flex gap-2">
                                <button onClick={() => setIsEditingNotes(false)} className="px-2.5 py-1 text-xs text-zinc-400 hover:text-white bg-zinc-800 rounded-lg">
                                    {t('general.cancel') || 'Cancelar'}
                                </button>
                                <button onClick={handleSaveNotes} className="px-2.5 py-1 text-xs text-white bg-[var(--accent)] hover:opacity-90 rounded-lg font-bold">
                                    {t('general.save') || 'Guardar'}
                                </button>
                            </div>
                        ) : (
                            <button onClick={() => { triggerFeedback('click'); handleStartEditingNotes(); }} className="p-1.5 text-zinc-400 hover:text-[var(--accent)] transition-colors flex items-center gap-1 text-xs font-bold">
                                <Edit2 size={14} />
                                <span>{t('history.editNotes') || 'Editar'}</span>
                            </button>
                        )}
                    </div>

                    {isEditingNotes ? (
                        <div className="pt-1">
                            <textarea
                                value={editedNotes}
                                onChange={(e) => setEditedNotes(e.target.value)}
                                placeholder="Notas ou observações sobre este treino..."
                                rows={3}
                                className="w-full bg-black/40 border border-[var(--border-color)] rounded-xl p-3 text-xs font-medium text-white outline-none focus:border-[var(--accent)] resize-none"
                            />
                        </div>
                    ) : (
                        <p className="text-sm text-zinc-300 italic">
                            {generateInstructorNote(training)}
                        </p>
                    )}
                </Card>
            </div>

            {/* Full Edit Modal */}
            <AnimatePresence>
                {isFullEditModalOpen && (
                    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 10 }}
                            className="bg-zinc-950 border border-zinc-800 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl my-8 flex flex-col max-h-[90vh]"
                        >
                            {/* Modal Header */}
                            <div className="p-5 border-b border-zinc-800/80 flex justify-between items-center bg-zinc-900/50">
                                <div>
                                    <span className="text-[10px] font-black uppercase tracking-widest text-[var(--accent)]">
                                        {t('history.fullEdit') || 'Edição Completa'}
                                    </span>
                                    <h3 className="text-lg font-black text-white uppercase">
                                        {t('history.editRecord') || 'Editar Registo'}
                                    </h3>
                                </div>
                                <button 
                                    onClick={() => setIsFullEditModalOpen(false)}
                                    className="p-2 text-zinc-500 hover:text-white rounded-full bg-zinc-800/50 transition-colors"
                                >
                                    <X size={18} />
                                </button>
                            </div>

                            {/* Modal Navigation Tabs */}
                            <div className="grid grid-cols-3 border-b border-zinc-800 bg-zinc-900/30 p-1.5 gap-1 text-xs font-bold">
                                <button
                                    type="button"
                                    onClick={() => { triggerFeedback('click'); setFullEditTab('scores'); }}
                                    className={`py-2 rounded-xl transition-all ${fullEditTab === 'scores' ? 'bg-[var(--accent)] text-white shadow' : 'text-zinc-400 hover:text-white'}`}
                                >
                                    Pontos & Séries
                                </button>
                                <button
                                    type="button"
                                    onClick={() => { triggerFeedback('click'); setFullEditTab('equipment'); }}
                                    className={`py-2 rounded-xl transition-all ${fullEditTab === 'equipment' ? 'bg-[var(--accent)] text-white shadow' : 'text-zinc-400 hover:text-white'}`}
                                >
                                    Arma & Munições
                                </button>
                                <button
                                    type="button"
                                    onClick={() => { triggerFeedback('click'); setFullEditTab('notes'); }}
                                    className={`py-2 rounded-xl transition-all ${fullEditTab === 'notes' ? 'bg-[var(--accent)] text-white shadow' : 'text-zinc-400 hover:text-white'}`}
                                >
                                    Data & Notas
                                </button>
                            </div>

                            {/* Modal Content */}
                            <div className="p-5 overflow-y-auto space-y-4 flex-1">
                                {fullEditTab === 'scores' && (
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-[10px] text-zinc-500 uppercase font-bold mb-1">{t('training.scoreGoal') || 'Meta de Pontos'}</label>
                                            <input 
                                                type="number"
                                                value={editedTargetPoints || ''}
                                                onChange={(e) => setEditedTargetPoints(Number(e.target.value))}
                                                placeholder="Ex: 250"
                                                className="w-full bg-black/50 border border-zinc-800 rounded-xl px-3 py-2 text-xs font-mono font-bold text-white outline-none focus:border-[var(--accent)]"
                                            />
                                        </div>

                                        <div className="space-y-3">
                                            {editedSeries.map((s_item, s_idx) => {
                                                const s_num = editedSeries.slice(0, s_idx).filter(prev => !prev.isWarmup).length + 1;
                                                return (
                                                    <div key={s_idx} className={`p-3.5 rounded-2xl border ${s_item.isWarmup ? 'bg-purple-950/20 border-purple-500/30' : 'bg-zinc-900/60 border-zinc-800'} space-y-2.5`}>
                                                        <div className="flex justify-between items-center">
                                                            <div className="flex items-center gap-2">
                                                                <span className={`text-xs font-black uppercase ${s_item.isWarmup ? 'text-purple-400' : 'text-zinc-200'}`}>
                                                                    {s_item.isWarmup ? t('training.warmup') : `Série ${s_num}`}
                                                                </span>
                                                                <button 
                                                                    type="button"
                                                                    onClick={() => handleToggleSeriesWarmup(s_idx)}
                                                                    className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase border transition-colors ${s_item.isWarmup ? 'bg-purple-500 text-white border-purple-400' : 'bg-zinc-800 text-zinc-400 border-zinc-700 hover:text-white'}`}
                                                                >
                                                                    {s_item.isWarmup ? 'Aquecimento' : 'Oficial'}
                                                                </button>
                                                            </div>
                                                            <div className="flex items-center gap-2">
                                                                <span className="text-xs font-mono font-bold text-[var(--accent)]">
                                                                    {s_item.score} pts
                                                                </span>
                                                                {editedSeries.length > 1 && (
                                                                    <button 
                                                                        type="button"
                                                                        onClick={() => handleRemoveSeries(s_idx)}
                                                                        className="text-zinc-600 hover:text-red-500 p-1"
                                                                        title="Eliminar série"
                                                                    >
                                                                        <Trash2 size={14} />
                                                                    </button>
                                                                )}
                                                            </div>
                                                        </div>

                                                        {/* Shot inputs grid */}
                                                        <div className="flex flex-wrap gap-1.5 items-center">
                                                            {(s_item.shots || []).map((val, shotIdx) => (
                                                                <input
                                                                    key={shotIdx}
                                                                    type="number"
                                                                    min={0}
                                                                    max={10}
                                                                    value={val}
                                                                    onChange={(e) => handleShotValueChange(s_idx, shotIdx, Number(e.target.value))}
                                                                    className={`w-9 h-9 rounded-xl text-center font-mono font-bold text-xs border outline-none focus:border-[var(--accent)] ${
                                                                        val === 10 
                                                                            ? 'border-amber-500/40 bg-amber-500/10 text-amber-400' 
                                                                            : val >= 8 
                                                                                ? 'border-[var(--accent)]/30 bg-[var(--accent)]/10 text-[var(--accent)]' 
                                                                                : 'border-zinc-700 bg-black/60 text-zinc-200'
                                                                    }`}
                                                                />
                                                            ))}
                                                            <button
                                                                type="button"
                                                                onClick={() => handleAddShotToSeries(s_idx)}
                                                                className="w-8 h-8 rounded-xl border border-dashed border-zinc-700 hover:border-[var(--accent)] text-zinc-400 hover:text-white flex items-center justify-center text-xs"
                                                                title="Adicionar tiro"
                                                            >
                                                                <Plus size={13} />
                                                            </button>
                                                            {s_item.shots.length > 1 && (
                                                                <button
                                                                    type="button"
                                                                    onClick={() => handleRemoveShotFromSeries(s_idx)}
                                                                    className="w-7 h-8 rounded-xl border border-zinc-800 text-zinc-500 hover:text-red-400 flex items-center justify-center text-xs"
                                                                    title="Remover último tiro"
                                                                >
                                                                    <X size={12} />
                                                                </button>
                                                            )}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>

                                        <button
                                            type="button"
                                            onClick={handleAddNewSeries}
                                            className="w-full py-2.5 rounded-xl border border-dashed border-zinc-700 hover:border-[var(--accent)] text-xs text-zinc-400 hover:text-white flex items-center justify-center gap-1.5 font-bold transition-colors"
                                        >
                                            <Plus size={14} />
                                            <span>Adicionar Nova Série</span>
                                        </button>

                                        {/* Summary calculation */}
                                        <div className="p-3 bg-black/40 rounded-2xl border border-zinc-800 flex justify-between items-center text-xs">
                                            <div>
                                                <span className="text-[10px] text-zinc-500 uppercase font-bold block">Total Recalculado</span>
                                                <span className="font-mono font-bold text-base text-[var(--accent)]">{liveStats.totalScore} pts</span>
                                            </div>
                                            <div className="text-right">
                                                <span className="text-[10px] text-zinc-500 uppercase font-bold block">Média por Disparo</span>
                                                <span className="font-mono font-bold text-zinc-300">{liveStats.averageScore} / 10</span>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {fullEditTab === 'equipment' && (
                                    <div className="space-y-3">
                                        <div className="grid grid-cols-2 gap-3">
                                            <div>
                                                <label className="block text-[10px] text-zinc-500 uppercase font-bold mb-1">Tipo de Sessão</label>
                                                <select 
                                                    value={editedSessionType}
                                                    onChange={(e) => setEditedSessionType(e.target.value as any)}
                                                    className="w-full bg-black/50 border border-zinc-800 rounded-xl px-3 py-2 text-xs font-medium text-white outline-none focus:border-[var(--accent)]"
                                                >
                                                    <option value="training">Treino</option>
                                                    <option value="competition">Prova</option>
                                                </select>
                                            </div>
                                            {editedSessionType === 'competition' && (
                                                <div>
                                                    <label className="block text-[10px] text-zinc-500 uppercase font-bold mb-1">Nome da Prova</label>
                                                    <input 
                                                        type="text" 
                                                        value={editedCompetitionName} 
                                                        onChange={(e) => setEditedCompetitionName(e.target.value)}
                                                        placeholder="Ex: Taça de Portugal"
                                                        className="w-full bg-black/50 border border-zinc-800 rounded-xl px-3 py-2 text-xs font-medium text-white outline-none focus:border-[var(--accent)]"
                                                    />
                                                </div>
                                            )}
                                        </div>

                                        <div className="grid grid-cols-2 gap-3">
                                            <div>
                                                <label className="block text-[10px] text-zinc-500 uppercase font-bold mb-1">Tipo de Arma</label>
                                                <select 
                                                    value={editedWeaponType}
                                                    onChange={(e) => setEditedWeaponType(e.target.value)}
                                                    className="w-full bg-black/50 border border-zinc-800 rounded-xl px-3 py-2 text-xs font-medium text-white outline-none focus:border-[var(--accent)]"
                                                >
                                                    <option value="Pistola">Pistola</option>
                                                    <option value="Carabina">Carabina</option>
                                                    <option value="Outra">Outra</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-[10px] text-zinc-500 uppercase font-bold mb-1">Modelo / Marca da Arma</label>
                                                <input 
                                                    type="text" 
                                                    value={editedWeaponModel} 
                                                    onChange={(e) => setEditedWeaponModel(e.target.value)}
                                                    placeholder="Ex: Glock 17, Pardini SP"
                                                    className="w-full bg-black/50 border border-zinc-800 rounded-xl px-3 py-2 text-xs font-medium text-white outline-none focus:border-[var(--accent)]"
                                                />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-3">
                                            <div>
                                                <label className="block text-[10px] text-zinc-500 uppercase font-bold mb-1">Calibre</label>
                                                <input 
                                                    type="text" 
                                                    value={editedCaliber} 
                                                    onChange={(e) => setEditedCaliber(e.target.value)}
                                                    placeholder="Ex: 9mm, .22LR, 4.5mm"
                                                    className="w-full bg-black/50 border border-zinc-800 rounded-xl px-3 py-2 text-xs font-medium text-white outline-none focus:border-[var(--accent)]"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-[10px] text-zinc-500 uppercase font-bold mb-1">Munição (Marca)</label>
                                                <input 
                                                    type="text" 
                                                    value={editedAmmoBrand} 
                                                    onChange={(e) => setEditedAmmoBrand(e.target.value)}
                                                    placeholder="Ex: GECO, Fiocchi, RWS"
                                                    className="w-full bg-black/50 border border-zinc-800 rounded-xl px-3 py-2 text-xs font-medium text-white outline-none focus:border-[var(--accent)]"
                                                />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-3">
                                            <div>
                                                <label className="block text-[10px] text-zinc-500 uppercase font-bold mb-1">Distância</label>
                                                <input 
                                                    type="text" 
                                                    value={editedDistance} 
                                                    onChange={(e) => setEditedDistance(e.target.value)}
                                                    placeholder="Ex: 10 metros, 25 metros"
                                                    className="w-full bg-black/50 border border-zinc-800 rounded-xl px-3 py-2 text-xs font-medium text-white outline-none focus:border-[var(--accent)]"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-[10px] text-zinc-500 uppercase font-bold mb-1">Tipo de Alvo</label>
                                                <input 
                                                    type="text" 
                                                    value={editedTargetType} 
                                                    onChange={(e) => setEditedTargetType(e.target.value)}
                                                    placeholder="Ex: Precisão, Duelo, C10"
                                                    className="w-full bg-black/50 border border-zinc-800 rounded-xl px-3 py-2 text-xs font-medium text-white outline-none focus:border-[var(--accent)]"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {fullEditTab === 'notes' && (
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-[10px] text-zinc-500 uppercase font-bold mb-1">Data da Sessão</label>
                                            <input 
                                                type="date"
                                                value={editedDate.split('T')[0]}
                                                onChange={(e) => setEditedDate(e.target.value)}
                                                className="w-full bg-black/50 border border-zinc-800 rounded-xl px-3 py-2 text-xs font-mono font-bold text-[var(--accent)] outline-none focus:border-[var(--accent)]"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-[10px] text-zinc-500 uppercase font-bold mb-1">Notas & Observações do Treinador/Atleta</label>
                                            <textarea
                                                value={editedNotes}
                                                onChange={(e) => setEditedNotes(e.target.value)}
                                                rows={5}
                                                placeholder="Insira observações sobre o agrupamento, gatilho, respiração, condições da linha..."
                                                className="w-full bg-black/50 border border-zinc-800 rounded-xl p-3 text-xs font-medium text-white outline-none focus:border-[var(--accent)] resize-none"
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Modal Footer */}
                            <div className="p-4 border-t border-zinc-800 bg-zinc-900/50 flex justify-end gap-2">
                                <button
                                    type="button"
                                    onClick={() => setIsFullEditModalOpen(false)}
                                    className="px-4 py-2.5 rounded-xl text-xs font-bold text-zinc-400 hover:text-white bg-zinc-800/80 transition-colors"
                                >
                                    {t('general.cancel') || 'Cancelar'}
                                </button>
                                <button
                                    type="button"
                                    onClick={handleSaveFullEdit}
                                    className="px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider text-white bg-[var(--accent)] hover:opacity-90 shadow-md transition-opacity flex items-center gap-1.5"
                                >
                                    <Save size={14} />
                                    <span>{t('history.saveChanges') || 'Guardar Alterações'}</span>
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <div className="h-20" />
        </div>
    );
};

const InfoScreen = ({ onNavigate }: { onNavigate: (page: string, params?: any) => void }) => {
    const t = useTranslation();
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [viewingPdf, setViewingPdf] = useState<string | null>(null);

    React.useEffect(() => {
        if (!viewingPdf) return;
        
        const handleTouchStart = (e: TouchEvent) => {
            // We only want to prevent the pull-to-refresh if we are at the very top
            // and pulling down. 
            // Note: Since the PDF is in an iframe, we can't easily check its internal scrollTop.
            // However, preventing the start of the gesture on the container can help.
        };

        const handleTouchMove = (e: TouchEvent) => {
            // Prevent default if we are potentially triggering a pull-to-refresh
            // Browsers often use the initial touchstart to decide.
        };

        // Standard way to prevent pull-to-refresh in some WebViews
        document.body.style.overflow = 'hidden';
        document.body.style.overscrollBehaviorY = 'none';

        return () => {
            document.body.style.overflow = '';
            document.body.style.overscrollBehaviorY = '';
        };
    }, [viewingPdf]);

    const categoriesList = [
        { id: "ISSF", name: "ISSF", icon: Target, color: "text-blue-500", bg: "bg-blue-500/10", subtitle: "International Shooting Sport Federation" },
        { id: "IPSC", name: "IPSC", icon: Target, color: "text-amber-400", bg: "bg-amber-400/10", subtitle: "International Practical Shooting Confederation" },
        { id: "MLAIC", name: "MLAIC", icon: Target, color: "text-orange-500", bg: "bg-orange-500/10", subtitle: t('info.mlaicEntity') },
        { id: "WFTF", name: "WFTF", icon: Target, color: "text-green-500", bg: "bg-green-500/10", subtitle: "World Field Target Federation" },
        { id: "BENCHREST", name: t('info.catBenchrest'), icon: Target, color: "text-cyan-400", bg: "bg-cyan-400/10", subtitle: t('info.catBenchrestSub') },
        { id: "TIRO ADAPTADO", name: t('info.catAdaptado'), icon: Target, color: "text-purple-400", bg: "bg-purple-400/10", subtitle: t('info.catAdaptadoSub') },
        { id: "FEDERAÇÃO", name: t('info.catFederacao'), icon: Target, color: "text-zinc-400", bg: "bg-zinc-400/10", subtitle: t('info.titleReg') }
    ];

    if (viewingPdf) {
        return (
            <div className="fixed inset-x-0 top-0 bottom-[80px] z-[900] bg-[var(--bg-primary)] flex flex-col max-w-md mx-auto border-x border-zinc-500/10 shadow-2xl overflow-hidden">
                <header className="flex items-center gap-4 py-5 px-6 border-b border-white/5 bg-[var(--bg-secondary)] shrink-0">
                    <button onClick={() => { triggerFeedback('click'); setViewingPdf(null); }} className="p-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] rounded-full bg-zinc-500/10 transition-colors">
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--accent)]">{t('info.institutional')}</span>
                        <h1 className="text-xs font-bold tracking-tight text-[var(--text-primary)] uppercase">{t('info.regulation')}</h1>
                    </div>
                </header>
                
                <div className="flex-1 flex flex-col items-center justify-center px-8 text-center bg-black/20">
                    <div className="w-24 h-24 rounded-full bg-[var(--accent)]/10 flex items-center justify-center mb-8 border border-[var(--accent)]/20 shadow-[0_0_40px_rgba(0,255,194,0.05)]">
                        <FileText size={48} className="text-[var(--accent)]" />
                    </div>
                    
                    <h2 className="text-3xl font-black text-[#00FFC2] uppercase tracking-tighter mb-4 leading-tight">
                        {t('info.titleReg')}
                    </h2>
                    
                    <p className="text-sm text-zinc-400 font-medium leading-relaxed max-w-[260px] mb-12">
                        {t('info.officialDoc')}
                    </p>

                    <a 
                        href="https://fptiro.pt/wp-content/uploads/2021/07/regulamento_licencas_federativas_11mai21.pdf"
                        target="_blank" 
                        rel="noopener noreferrer"
                        onClick={() => triggerFeedback('click')}
                        className="w-full py-6 bg-[#00FFC2] text-black font-black uppercase tracking-[0.15em] rounded-2xl shadow-[0_15px_35px_rgba(0,255,194,0.2)] hover:scale-[1.02] active:scale-95 transition-all text-sm flex items-center justify-center gap-3"
                    >
                        <FileText size={18} />
                        {t('info.downloadPdf')}
                    </a>
                    
                    <p className="mt-8 text-[10px] text-zinc-600 font-bold uppercase tracking-widest">
                        {t('info.pdfOfficial')}
                    </p>
                </div>
            </div>
        );
    }

    if (selectedCategory === 'ISSF') {
        const cat = categoriesList.find(c => c.id === 'ISSF')!;
        return (
            <div className="p-3 bg-[var(--bg-primary)]">
                <header className="flex items-center gap-3 py-6 px-3 mb-3">
                    <button onClick={() => setSelectedCategory(null)} className="p-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] rounded-full bg-zinc-500/10 transition-colors">
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--accent)]">{t('info.internationalOrg')}</span>
                        <h1 className="text-2xl font-bold tracking-tight text-[var(--text-primary)]">{cat.name}</h1>
                    </div>
                </header>

                <div className="space-y-8 px-2 pb-40">
                    <section>
                        <h2 className="text-[var(--accent)] font-black text-xs uppercase tracking-[0.2em] mb-4">{t('info.framing')}</h2>
                        <Card className="p-5 space-y-4 border-[var(--border-color)] bg-[var(--bg-secondary)] overflow-visible">
                            <p className="text-sm border-b border-white/5 pb-4 font-bold text-[var(--text-primary)] leading-relaxed uppercase tracking-tight">{t('info.precisionTitle')}</p>
                            <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                                {t('info.issfFrame1')}
                            </p>
                            <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                                {t('info.issfFrame2')}
                            </p>
                            <div className="p-3 bg-[var(--accent)]/10 border border-[var(--accent)]/20 rounded-xl">
                                <p className="text-xs text-[var(--accent)] font-medium italic">
                                    {t('info.issfQuote')}
                                </p>
                            </div>
                        </Card>
                    </section>

                    <section>
                        <h2 className="text-[#00FF88] font-black text-xs uppercase tracking-[0.2em] mb-4">{t('info.olympic')}</h2>
                        <div className="space-y-4">
                            {[
                                { 
                                    title: t('info.pistol10m'), 
                                    desc: t('info.pistol10mDesc')
                                },
                                { 
                                    title: t('info.pistol25mVel'), 
                                    desc: t('info.pistol25mVelDesc')
                                },
                                { 
                                    title: t('info.pistol25mSen'), 
                                    desc: t('info.pistol25mSenDesc')
                                },
                                { 
                                    title: t('info.rifle10m'), 
                                    desc: t('info.rifle10mDesc')
                                },
                                { 
                                    title: t('info.rifle50m3p'), 
                                    desc: t('info.rifle50m3pDesc')
                                },
                                { 
                                    title: t('info.rifle50mDeitado'), 
                                    desc: t('info.rifle50mDeitadoDesc')
                                }
                            ].map((d, i) => (
                                <div key={i}>
                                    <Card className="p-4 border-[var(--border-color)] bg-[var(--bg-secondary)]/50 overflow-visible">
                                        <h3 className="font-bold text-sm mb-2 text-[var(--text-primary)]">{d.title}</h3>
                                        <p className="text-xs text-[var(--text-secondary)] leading-relaxed">{d.desc}</p>
                                    </Card>
                                </div>
                            ))}
                        </div>
                    </section>

                    <section>
                        <h2 className="text-[#FFCC00] font-black text-xs uppercase tracking-[0.2em] mb-4">{t('info.nonOlympic')}</h2>
                        <div className="space-y-4">
                            {[
                                { title: t('info.pistol50mH'), desc: t('info.pistol50mHDesc') },
                                { title: t('info.pistolCentralH'), desc: t('info.pistolCentralHDesc') },
                                { title: t('info.pistolStandardH'), desc: t('info.pistolStandardHDesc') },
                                { title: t('info.rifle300m3pH'), desc: t('info.rifle300m3pHDesc') }
                            ].map((d, i) => (
                                <div key={i}>
                                    <Card className="p-4 border-[var(--border-color)] bg-[var(--bg-secondary)]/50 overflow-visible">
                                        <h3 className="font-bold text-sm mb-2 text-[var(--text-primary)]">{d.title}</h3>
                                        <p className="text-xs text-[var(--text-secondary)] leading-relaxed">{d.desc}</p>
                                    </Card>
                                </div>
                            ))}
                        </div>
                    </section>
                    <div className="h-20" />
                </div>
            </div>
        );
    }

    if (selectedCategory === 'IPSC') {
        const cat = categoriesList.find(c => c.id === 'IPSC')!;
        return (
            <div className="p-3 bg-[var(--bg-primary)]">
                <header className="flex items-center gap-3 py-6 px-3 mb-3">
                    <button onClick={() => setSelectedCategory(null)} className="p-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] rounded-full bg-zinc-500/10 transition-colors">
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-400">{t('info.intConfed')}</span>
                        <h1 className="text-2xl font-bold tracking-tight text-[var(--text-primary)]">{cat.name}</h1>
                    </div>
                </header>

                <div className="space-y-8 px-2 pb-40">
                    <section>
                        <h2 className="text-[var(--accent)] font-black text-xs uppercase tracking-[0.2em] mb-4">{t('info.historyOrigin')}</h2>
                        <Card className="p-5 space-y-4 border-[var(--border-color)] bg-[var(--bg-secondary)] overflow-visible">
                            <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                                {t('info.ipscHistoryDesc1')}
                            </p>
                            <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                                {t('info.ipscHistoryDesc2')}
                            </p>
                            <p className="text-xs text-[var(--text-secondary)]">
                                {t('info.ipscHistoryDesc3')}
                            </p>
                        </Card>
                    </section>

                    <section>
                        <h2 className="text-[#FF3366] font-black text-xs uppercase tracking-[0.2em] mb-4">{t('info.lema')}</h2>
                        <div className="grid grid-cols-3 gap-2">
                            <Card className="p-3 text-center border-[var(--border-color)] bg-[var(--bg-secondary)]">
                                <span className="text-[var(--accent)] font-bold text-xs uppercase">Diligentia</span>
                                <p className="text-[10px] text-[var(--text-secondary)] mt-1 uppercase tracking-tighter">{t('home.precision')}</p>
                            </Card>
                            <Card className="p-3 text-center border-[var(--border-color)] bg-[var(--bg-secondary)]">
                                <span className="text-[var(--accent)] font-bold text-xs uppercase">Vis</span>
                                <p className="text-[10px] text-[var(--text-secondary)] mt-1 uppercase tracking-tighter">{t('home.targets')}</p>
                            </Card>
                            <Card className="p-3 text-center border-[var(--border-color)] bg-[var(--bg-secondary)]">
                                <span className="text-[var(--accent)] font-bold text-xs uppercase">Celeritas</span>
                                <p className="text-[10px] text-[var(--text-secondary)] mt-1 uppercase tracking-tighter">{t('training.time')}</p>
                            </Card>
                        </div>
                    </section>

                    <section>
                        <h2 className="text-[#00CCFF] font-black text-xs uppercase tracking-[0.2em] mb-4">{t('info.ipscPortugal')}</h2>
                        <Card className="p-5 border-[var(--border-color)] bg-[var(--bg-secondary)] space-y-4 overflow-visible">
                            <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                                {t('info.ipscPortugalDesc')}
                            </p>
                            <div className="space-y-3 pt-2">
                                <h4 className="text-[10px] uppercase font-bold text-[var(--text-secondary)] tracking-widest">{t('info.ipscRequirements')}</h4>
                                <ul className="space-y-2">
                                    <li className="flex items-center gap-3 text-xs text-[var(--text-primary)]">
                                        <div className="w-1.5 h-1.5 rounded-full bg-[var(--accent)]" />
                                        {t('info.ipscReq1')}
                                    </li>
                                    <li className="flex items-center gap-3 text-xs text-[var(--text-primary)]">
                                        <div className="w-1.5 h-1.5 rounded-full bg-[var(--accent)]" />
                                        {t('info.ipscReq2')}
                                    </li>
                                    <li className="flex items-center gap-3 text-xs text-[var(--text-primary)]">
                                        <div className="w-1.5 h-1.5 rounded-full bg-[var(--accent)]" />
                                        {t('info.ipscReq3')}
                                    </li>
                                </ul>
                            </div>
                        </Card>
                    </section>
                    <div className="h-20" />
                </div>
            </div>
        );
    }

    if (selectedCategory === 'MLAIC') {
        const cat = categoriesList.find(c => c.id === 'MLAIC')!;
        return (
            <div className="p-3 bg-[var(--bg-primary)]">
                <header className="flex items-center gap-3 py-6 px-3 mb-3">
                    <button onClick={() => setSelectedCategory(null)} className="p-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] rounded-full bg-zinc-500/10 transition-colors">
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-orange-500">{t('info.muzzleLoading')}</span>
                        <h1 className="text-2xl font-bold tracking-tight text-[var(--text-primary)]">{cat.name}</h1>
                    </div>
                </header>

                <div className="space-y-8 px-2 pb-40">
                    <section>
                        <h2 className="text-[var(--accent)] font-black text-xs uppercase tracking-[0.2em] mb-4">{t('info.gunpowder')}</h2>
                        <Card className="p-5 space-y-4 border-[var(--border-color)] bg-[var(--bg-secondary)] overflow-visible">
                            <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                                {t('info.mlaicHistoryDesc')}
                            </p>
                            <p className="text-xs text-[var(--text-secondary)] italic">
                                {t('info.mlaicEntity')}
                            </p>
                            <div className="p-3 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl">
                                <p className="text-[10px] text-[var(--text-secondary)] uppercase tracking-widest font-bold mb-1">{t('info.mlaicHighlights')}</p>
                                <p className="text-xs text-[var(--text-primary)]">{t('info.mlaicHighlightsDesc')}</p>
                            </div>
                        </Card>
                    </section>

                    <section>
                        <h2 className="text-[#8B4513] font-black text-xs uppercase tracking-[0.2em] mb-4">{t('info.weaponsCategories')}</h2>
                        <div className="space-y-4">
                            <Card className="p-4 border-[var(--border-color)] bg-[var(--bg-secondary)]/50 overflow-visible">
                                <h3 className="font-bold text-sm mb-3 text-[var(--text-primary)]">{t('info.mlaicClassification')}</h3>
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="p-2 bg-[var(--bg-primary)]/50 rounded-lg border border-[var(--border-color)]">
                                        <p className="text-[10px] font-bold text-[var(--accent)] uppercase">{t('info.original')}</p>
                                        <p className="text-[9px] text-[var(--text-secondary)]">{t('info.mlaicOriginalDesc')}</p>
                                    </div>
                                    <div className="p-2 bg-[var(--bg-primary)]/50 rounded-lg border border-[var(--border-color)]">
                                        <p className="text-[10px] font-bold text-[var(--accent)] uppercase">{t('info.replica')}</p>
                                        <p className="text-[9px] text-[var(--text-secondary)]">{t('info.mlaicReplicaDesc')}</p>
                                    </div>
                                </div>
                            </Card>

                            <Card className="p-4 border-[var(--border-color)] bg-[var(--bg-secondary)]/50 overflow-visible">
                                <h3 className="font-bold text-sm mb-2 text-[var(--text-primary)]">{t('info.disciplines')}</h3>
                                <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                                    {t('info.mlaicDisciplinesDesc')}
                                </p>
                            </Card>
                        </div>
                    </section>

                    <section>
                        <h2 className="text-[#33AAFF] font-black text-xs uppercase tracking-[0.2em] mb-4">{t('info.provasPortugal')}</h2>
                        <Card className="p-5 border-[var(--border-color)] bg-[var(--bg-secondary)] space-y-4 overflow-visible">
                            <div className="flex justify-between items-center border-b border-[var(--border-color)] pb-3">
                                <div>
                                    <p className="text-[10px] uppercase font-bold text-[var(--text-secondary)]">{t('info.duration')}</p>
                                    <p className="text-sm font-bold text-[var(--text-primary)]">30 {t('info.duration')}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] uppercase font-bold text-[var(--text-secondary)]">{t('training.shots')}</p>
                                    <p className="text-sm font-bold text-[var(--text-primary)]">{t('info.mlaic13Shots')}</p>
                                </div>
                            </div>
                            
                            <div className="space-y-3">
                                <h4 className="text-[10px] uppercase font-bold text-[var(--text-secondary)] tracking-widest">{t('info.distances')}</h4>
                                <div className="flex gap-2">
                                    <span className="px-2 py-1 bg-zinc-500/10 rounded text-[10px] text-[var(--text-secondary)]">{t('info.mlaicHandgun')}: 25m / 50m</span>
                                    <span className="px-2 py-1 bg-zinc-500/10 rounded text-[10px] text-[var(--text-secondary)]">{t('info.mlaicLonggun')}: 50m</span>
                                </div>
                            </div>
                        </Card>
                    </section>
                    <div className="h-20" />
                </div>
            </div>
        );
    }

    if (selectedCategory === 'BENCHREST') {
        const cat = categoriesList.find(c => c.id === 'BENCHREST')!;
        return (
            <div className="p-3 bg-[var(--bg-primary)]">
                <header className="flex items-center gap-3 py-6 px-3 mb-3">
                    <button onClick={() => setSelectedCategory(null)} className="p-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] rounded-full bg-zinc-500/10 transition-colors">
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-cyan-400">{t('info.highPrecision')}</span>
                        <h1 className="text-2xl font-bold tracking-tight text-[var(--text-primary)] font-mono uppercase">{cat.name}</h1>
                    </div>
                </header>

                <div className="space-y-8 px-2 pb-40">
                    <section>
                        <h2 className="text-[var(--accent)] font-black text-xs uppercase tracking-[0.2em] mb-4">{t('info.searchCenter')}</h2>
                        <Card className="p-5 space-y-4 border-[var(--border-color)] bg-[var(--bg-secondary)] overflow-visible">
                            <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                                {t('info.benchrestDesc')}
                            </p>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-3 bg-[var(--bg-primary)]/50 border border-[var(--border-color)] rounded-xl">
                                    <p className="text-[10px] font-bold text-[var(--text-secondary)] uppercase mb-1">{t('info.grouping')}</p>
                                    <p className="text-[11px] text-[var(--text-primary)]">{t('info.benchrestGroupingDesc')}</p>
                                </div>
                                <div className="p-3 bg-[var(--bg-primary)]/50 border border-[var(--border-color)] rounded-xl">
                                    <p className="text-[10px] font-bold text-[var(--text-secondary)] uppercase mb-1">{t('info.targetCenter')}</p>
                                    <p className="text-[11px] text-[var(--text-primary)]">{t('info.benchrestCenterDesc')}</p>
                                </div>
                            </div>
                        </Card>
                    </section>

                    <section>
                        <h2 className="text-[#00CCFF] font-black text-xs uppercase tracking-[0.2em] mb-4">{t('info.disciplines')}</h2>
                        <Card className="p-5 border-[var(--border-color)] bg-[var(--bg-secondary)] space-y-4 overflow-visible">
                            <div className="space-y-3">
                                {[
                                    { dist: "25m", type: t('info.benchrestAir') },
                                    { dist: "50m", type: t('info.benchrestRimfire') },
                                    { dist: `100m, 200m ${t('general.avg').includes('prom') ? 'y' : 'e'} 300m`, type: t('info.benchrestCenterfire') }
                                ].map((item, i) => (
                                    <div key={i} className="flex items-center justify-between py-2 border-b border-[var(--border-color)] last:border-0">
                                        <span className="text-sm font-black text-[var(--accent)]">{item.dist}</span>
                                        <span className="text-[11px] text-[var(--text-secondary)]">{item.type}</span>
                                    </div>
                                ))}
                            </div>
                            <p className="text-xs text-[var(--text-secondary)] italic mt-4">
                                {t('info.benchrestEquipmentNote')}
                            </p>
                        </Card>
                    </section>

                    <section>
                        <h2 className="text-zinc-500 font-black text-xs uppercase tracking-[0.2em] mb-4">{t('info.internationalOrg')}</h2>
                        <div className="grid grid-cols-1 gap-2 pb-10">
                            {["W.R.A.B.F.", "E.R.A.B.S.F.", "W.B.S.F."].map((org, i) => (
                                <div key={i} className="px-4 py-2 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg flex items-center justify-between">
                                    <span className="text-xs font-bold text-[var(--text-primary)]">{org}</span>
                                    <CheckCircle2 size={14} className="text-[var(--accent)] opacity-40" />
                                </div>
                            ))}
                            <p className="text-[10px] text-[var(--text-secondary)] mt-2 px-2 leading-relaxed">
                                {t('info.benchrestFptOrg')}
                            </p>
                        </div>
                    </section>
                    <div className="h-24" />
                </div>
            </div>
        );
    }

    if (selectedCategory === 'TIRO ADAPTADO') {
        const cat = categoriesList.find(c => c.id === 'TIRO ADAPTADO')!;
        return (
            <div className="p-3 bg-[var(--bg-primary)]">
                <header className="flex items-center gap-3 py-6 px-3 mb-3">
                    <button onClick={() => setSelectedCategory(null)} className="p-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] rounded-full bg-zinc-500/10 transition-colors">
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-purple-400">Tiro Paralímpico</span>
                        <h1 className="text-2xl font-bold tracking-tight text-[var(--text-primary)] font-mono uppercase">{cat.name}</h1>
                    </div>
                </header>

                <div className="space-y-8 px-2 pb-40">
                    <section>
                        <h2 className="text-[var(--accent)] font-black text-xs uppercase tracking-[0.2em] mb-4">{t('info.catAdaptadoSub')}</h2>
                        <Card className="p-5 space-y-4 border-[var(--border-color)] bg-[var(--bg-secondary)] overflow-visible">
                            <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                                {t('info.adaptadoIntro')}
                            </p>
                            <div className="p-3 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl">
                                <p className="text-[10px] text-[var(--text-secondary)] uppercase tracking-widest font-bold mb-1">{t('info.functionalClasses')}</p>
                                <p className="text-xs text-[var(--text-primary)]">{t('info.adaptadoClassesDesc')}</p>
                            </div>
                        </Card>
                    </section>

                    <section>
                        <h2 className="text-[#00FF88] font-black text-xs uppercase tracking-[0.2em] mb-4">{t('info.disciplines')}</h2>
                        <div className="space-y-4">
                            {[
                                { title: "a) Pistola 10m (P1) – Homens (SH1)", desc: t('info.p1Desc') },
                                { title: "b) Pistola 10m (P2) – Senhoras (SH1)", desc: t('info.p2Desc') },
                                { title: "c) Pistola 25m (P3) – Misto (SH1)", desc: t('info.p3Desc') },
                                { title: "d) Pistola 50m (P4) – Misto (SH1)", desc: t('info.p4Desc') },
                                { title: "e) Carabina 10m em Pé (R1/R2) – SH1", desc: t('info.r1r2Desc') },
                                { title: "f) Carabina 10m Deitado (R3) – Misto (SH1)", desc: t('info.r3Desc') },
                                { title: "g) Carabina 10m em Pé (R4) – Misto (SH2)", desc: t('info.r4Desc') },
                                { title: "h) Carabina 10m Deitado (R5) – Misto (SH2)", desc: t('info.r5Desc') },
                                { title: "i) Carabina 50m Deitado (R6) – Misto (SH1)", desc: t('info.r6Desc') }
                            ].map((d, i) => (
                                <div key={i}>
                                    <Card className="p-4 border-[var(--border-color)] bg-[var(--bg-secondary)]/50 overflow-visible">
                                        <h3 className="font-bold text-sm mb-2 text-[var(--text-primary)]">{d.title}</h3>
                                        <p className="text-xs text-[var(--text-secondary)] leading-relaxed">{d.desc}</p>
                                    </Card>
                                </div>
                            ))}
                        </div>
                    </section>
                    <div className="h-20" />
                </div>
            </div>
        );
    }

    if (selectedCategory === 'WFTF') {
        const cat = categoriesList.find(c => c.id === 'WFTF')!;
        return (
            <div className="p-3 bg-[var(--bg-primary)]">
                <header className="flex items-center gap-3 py-6 px-3 mb-3">
                    <button onClick={() => setSelectedCategory(null)} className="p-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] rounded-full bg-zinc-500/10 transition-colors">
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-green-500">Field Target</span>
                        <h1 className="text-2xl font-bold tracking-tight text-[var(--text-primary)] font-mono uppercase">{cat.name}</h1>
                    </div>
                </header>

                <div className="space-y-8 px-2 pb-40">
                    <section>
                        <h2 className="text-[var(--accent)] font-black text-xs uppercase tracking-[0.2em] mb-4">{t('info.wftfScenario')}</h2>
                        <Card className="p-5 space-y-4 border-[var(--border-color)] bg-[var(--bg-secondary)] overflow-visible">
                            <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                                {t('info.wftfScenarioDesc1')}
                            </p>
                            <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                                {t('info.wftfScenarioDesc2')}
                            </p>
                            <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-xl">
                                <p className="text-xs text-green-500 font-medium italic">
                                    {t('info.wftfQuote')}
                                </p>
                            </div>
                        </Card>
                    </section>

                    <section>
                        <h2 className="text-[#FFAA33] font-black text-xs uppercase tracking-[0.2em] mb-4">{t('info.wftfTechnique')}</h2>
                        <div className="space-y-4">
                            <Card className="p-4 border-[var(--border-color)] bg-[var(--bg-secondary)]/50 overflow-visible">
                                <h3 className="font-bold text-sm mb-2 text-[var(--text-primary)]">{t('info.wftfSilhouettes')}</h3>
                                <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                                    {t('info.wftfSilhouettesDesc')}
                                </p>
                            </Card>

                            <Card className="p-4 border-[var(--border-color)] bg-[var(--bg-secondary)]/50 overflow-visible">
                                <h3 className="font-bold text-sm mb-2 text-[var(--text-primary)]">{t('info.wftfPositions')}</h3>
                                <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                                    {t('info.wftfPositionsDesc')}
                                </p>
                            </Card>
                        </div>
                    </section>

                    <section>
                        <h2 className="text-[#33AAFF] font-black text-xs uppercase tracking-[0.2em] mb-4">{t('info.wftfEquip')}</h2>
                        <Card className="p-5 border-[var(--border-color)] bg-[var(--bg-secondary)] space-y-4 overflow-visible">
                            <div className="space-y-4">
                                <div className="flex gap-4 items-start">
                                    <div className="w-8 h-8 rounded-lg bg-[var(--bg-primary)]/50 flex items-center justify-center shrink-0 border border-[var(--border-color)]">
                                        <Target size={16} className="text-[var(--accent)]" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-tight">{t('info.wftfWeapons')}</p>
                                        <p className="text-[10px] text-[var(--text-secondary)]">{t('info.wftfWeaponsDesc')}</p>
                                    </div>
                                </div>
                                <div className="flex gap-4 items-start">
                                    <div className="w-8 h-8 rounded-lg bg-[var(--bg-primary)]/50 flex items-center justify-center shrink-0 border border-[var(--border-color)]">
                                        <Eye size={16} className="text-[var(--accent)]" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-tight">{t('info.wftfScope')}</p>
                                        <p className="text-[10px] text-[var(--text-secondary)]">{t('info.wftfScopeDesc')}</p>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    </section>
                    <div className="h-20" />
                </div>
            </div>
        );
    }

    if (selectedCategory === 'FEDERAÇÃO') {
        const cat = categoriesList.find(c => c.id === 'FEDERAÇÃO')!;
        return (
            <div className="p-3 bg-[var(--bg-primary)]">
                <header className="flex items-center gap-3 py-6 px-3 mb-3">
                    <button onClick={() => setSelectedCategory(null)} className="p-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] rounded-full bg-zinc-500/10 transition-colors">
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-secondary)]">{t('info.fedTitle')}</span>
                        <h1 className="text-2xl font-bold tracking-tight text-[var(--text-primary)] font-mono uppercase">{cat.name}</h1>
                    </div>
                </header>

                <div className="space-y-8 px-2 pb-40">
                    <section>
                        <h2 className="text-[var(--accent)] font-black text-xs uppercase tracking-[0.2em] mb-4">{t('info.fedNationalDisc')}</h2>
                        <div className="space-y-4">
                            <Card className="p-4 border-[var(--border-color)] bg-[var(--bg-secondary)] overflow-visible space-y-3">
                                <h3 className="font-bold text-sm text-[var(--text-primary)]">{t('info.fedCarabinaCano')}</h3>
                                <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                                    {t('info.fedCarabinaCanoDesc')}
                                </p>
                            </Card>

                            <Card className="p-4 border-[var(--border-color)] bg-[var(--bg-secondary)] overflow-visible space-y-4">
                                <h3 className="font-bold text-sm text-[var(--text-primary)] border-b border-[var(--border-color)] pb-2">{t('info.fedPistola5T')}</h3>
                                <div className="grid grid-cols-1 gap-3">
                                    <div className="flex justify-between items-center text-xs">
                                        <span className="text-[var(--text-secondary)] font-medium uppercase tracking-tighter">{t('info.original')}</span>
                                        <span className="text-[var(--text-primary)]">{t('info.fedPistola5TPDesc')}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-xs">
                                        <span className="text-[var(--accent)] font-bold uppercase tracking-tighter">{t('info.replica')}</span>
                                        <span className="text-[var(--text-primary)]">{t('info.fedPistola5TVDesc')}</span>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-3 pt-2">
                                    <div className="p-3 bg-[var(--bg-primary)]/50 rounded-xl">
                                        <p className="text-[10px] font-bold text-[#FFAA33] uppercase">{t('info.fedVelocidade')}</p>
                                        <p className="text-[11px] text-[var(--text-secondary)]">{t('info.fedVelocidadeDesc')}</p>
                                    </div>
                                    <div className="p-3 bg-[var(--bg-primary)]/50 rounded-xl">
                                        <p className="text-[10px] font-bold text-[#33AAFF] uppercase">{t('info.fedStandard')}</p>
                                        <p className="text-[11px] text-[var(--text-secondary)]">{t('info.fedStandardDesc')}</p>
                                    </div>
                                </div>
                            </Card>

                            <Card className="p-4 border-[var(--border-color)] bg-[var(--bg-secondary)] overflow-visible space-y-2">
                                <div className="flex justify-between items-center">
                                    <h3 className="font-bold text-sm text-[var(--text-primary)]">{t('info.fedAr50')}</h3>
                                    <span className="px-2 py-0.5 bg-[var(--accent)]/10 text-[var(--accent)] text-[9px] font-bold rounded uppercase">{t('info.fedEquipasMistas')}</span>
                                </div>
                                <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                                    {t('info.fedAr50Desc')}
                                </p>
                            </Card>

                            <Card className="p-4 border-[var(--border-color)] bg-[var(--bg-secondary)] overflow-visible space-y-3">
                                <h3 className="font-bold text-sm text-[var(--text-primary)]">{t('info.fedPistolaAr')}</h3>
                                <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                                    {t('info.fedPistolaArDesc')}
                                </p>
                            </Card>
                        </div>
                    </section>

                    <section>
                        <h2 className="text-[var(--text-secondary)] font-black text-xs uppercase tracking-[0.2em] mb-4">{t('info.bulletPrecision')}</h2>
                        <div className="space-y-4">
                            <Card className="p-4 border-[var(--border-color)] bg-[var(--bg-secondary)]/50 overflow-visible">
                                <h3 className="font-bold text-sm mb-2 text-[var(--text-primary)]">{t('info.fedRecreio25m')}</h3>
                                <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                                    {t('info.fedRecreio25mDesc')}
                                </p>
                            </Card>
                            <Card className="p-4 border-[var(--border-color)] bg-[var(--bg-secondary)]/50 overflow-visible">
                                <h3 className="font-bold text-sm mb-2 text-[var(--text-primary)]">Carabina Standard Pequeno Calibre</h3>
                                <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                                    Praticada com carabinas .22 a 50m. 60 tiros em posição de pé (01h15) ou deitado (01h00).
                                </p>
                            </Card>
                            <Card className="p-4 border-[var(--border-color)] bg-[var(--bg-secondary)]/50 overflow-visible">
                                <h3 className="font-bold text-sm mb-2 text-[var(--text-primary)]">Pistola Sport 9mm e .45 ACP</h3>
                                <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                                    Precisão (6x5t / 5 min) e Velocidade (6x5t / 20 seg). Distância 25m. Grande exigência pelo calibre.
                                </p>
                            </Card>
                        </div>
                    </section>

                    <section>
                        <h2 className="text-[#A0A0A0] font-black text-xs uppercase tracking-[0.2em] mb-4">Armas de Ordenança</h2>
                        <Card className="p-5 border-white/5 bg-white/5 space-y-4 overflow-visible">
                            <p className="text-xs text-zinc-400 leading-relaxed italic">
                                Armas anteriores a 1960. Provas exigentes pela antiguidade e calibres (6-8mm carabina, 7.65-9mm pistola).
                            </p>
                            <div className="space-y-3">
                                <div className="flex gap-4">
                                    <div className="w-1.5 h-1.5 rounded-full bg-zinc-600 mt-1.5" />
                                    <div>
                                        <p className="text-xs font-bold text-white">Pistola (25m)</p>
                                        <p className="text-[10px] text-zinc-500">Sub-provas de precisão e velocidade.</p>
                                    </div>
                                </div>
                                <div className="flex gap-4">
                                    <div className="w-1.5 h-1.5 rounded-full bg-zinc-600 mt-1.5" />
                                    <div>
                                        <p className="text-xs font-bold text-white">Carabina (300m)</p>
                                        <p className="text-[10px] text-zinc-500">Deitado (40t/01h10) ou 3 Posições (3x20t/02h15).</p>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    </section>
                    <div className="h-20" />
                </div>
            </div>
        );
    }

    return (
        <div className="p-3 pb-32 bg-[var(--bg-primary)]">
            <header className="flex flex-col gap-2 py-8 px-3 mb-1">
                <div className="flex items-center gap-2">
                    <button onClick={() => onNavigate('home')} className="p-2 -ml-2 text-zinc-500 hover:text-white rounded-full transition-colors">
                        <ArrowLeft size={18} />
                    </button>
                    <span className="text-[9px] font-black uppercase tracking-[0.3em] text-[var(--text-secondary)]">{t('settings.info')}</span>
                </div>
                <h1 className="text-3xl font-black tracking-tighter text-[var(--text-primary)] italic">INFO<span className="text-[var(--accent)]">RMAÇÕES</span></h1>
                <div className="h-1 w-10 bg-[var(--accent)] rounded-full mt-1" />
            </header>
            
            <div className="space-y-3 px-2">
                {categoriesList.map((cat, idx) => {
                    const Icon = cat.icon;
                    return (
                        <motion.div 
                            key={idx} 
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.05 }}
                            onClick={() => {
                                triggerFeedback('click');
                                setSelectedCategory(cat.id);
                            }} 
                            className="cursor-pointer group"
                        >
                            <div className="relative overflow-hidden p-5 rounded-3xl border border-[var(--border-color)] bg-gradient-to-br from-white/[0.03] to-transparent hover:border-[var(--accent)]/40 transition-all active:scale-[0.98]">
                                <div className="flex items-center justify-between relative z-10">
                                    <div className="flex items-center gap-5">
                                        <div className={`w-10 h-10 rounded-2xl ${cat.bg} flex items-center justify-center border border-[var(--border-color)]`}>
                                            <Icon size={20} className={cat.color} />
                                        </div>
                                        <div>
                                            <h3 className="font-black text-xl tracking-tighter text-[var(--text-primary)] uppercase group-hover:text-[var(--accent)] transition-colors">{cat.name}</h3>
                                            <p className="text-[9px] text-[var(--text-secondary)] font-bold uppercase tracking-widest mt-1">{cat.subtitle}</p>
                                        </div>
                                    </div>
                                    <ChevronRight size={20} className="text-zinc-400 group-hover:text-[var(--accent)] group-hover:translate-x-1 transition-all" />
                                </div>
                                <div className="absolute -right-4 -bottom-4 opacity-[0.02] group-hover:opacity-[0.05] transition-opacity">
                                    <Icon size={120} />
                                </div>
                            </div>
                        </motion.div>
                    );
                })}
            </div>

            <div className="space-y-3 px-2">
                <label className="text-[10px] font-black uppercase tracking-[0.4em] text-[var(--text-secondary)] px-3 mb-2 block">{t('info.institutional')}</label>
                <motion.div 
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 }}
                    onClick={() => {
                        triggerFeedback('click');
                        setViewingPdf("https://fptiro.pt/wp-content/uploads/2021/07/regulamento_licencas_federativas_11mai21.pdf");
                    }}
                    className="cursor-pointer group"
                >
                    <div className="p-4 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] hover:bg-white/[0.03] transition-all flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-8 h-8 rounded-xl bg-zinc-900 flex items-center justify-center border border-[var(--border-color)]">
                                <Target size={14} className="text-zinc-500" />
                            </div>
                            <h3 className="font-bold text-xs text-[var(--text-secondary)] uppercase tracking-tight group-hover:text-[var(--accent)] transition-colors">{t('info.titleReg')}</h3>
                        </div>
                        <ChevronRight size={14} className="text-zinc-400" />
                    </div>
                </motion.div>
            </div>

            <div className="mt-16 p-10 text-center border-t border-white/5 mx-4 flex flex-col items-center">
                <Target size={24} className="text-zinc-800 mb-2" />
                <p className="text-[8px] uppercase font-black tracking-[0.5em] text-zinc-800">Elite Performance Training System</p>
            </div>
            <div className="h-20" />
        </div>
    );
};

// --- Layouts ---

const Header = ({ title, onBack, rightElement }: { title: string; onBack?: () => void; rightElement?: React.ReactNode }) => (
  <div className="flex items-center justify-between py-4 px-3 mb-1">
    <div className="flex items-center gap-3">
      {onBack && (
        <button 
          onClick={() => { triggerFeedback('click'); onBack(); }} 
          className="p-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] rounded-full bg-zinc-500/10 active:scale-90 transition-transform"
        >
          <ArrowLeft size={22} />
        </button>
      )}
      <h1 className="text-xl font-black uppercase tracking-tighter text-[var(--text-primary)]">{title}</h1>
    </div>
    {rightElement}
  </div>
);

// --- Pages ---

const LoginScreen = ({ onEnter }: { onEnter: () => void }) => {
  const { setTheme, theme } = useTheme();
  const t = useTranslation();

  const handleLogin = async () => {
    localStorage.setItem('has_entered_precision', 'true');
    onEnter();
  };

  return (
    <div className="flex flex-col items-center justify-center p-6 text-center bg-black relative">
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[var(--accent)] opacity-10 blur-[100px] rounded-full pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-[var(--accent)] opacity-10 blur-[100px] rounded-full pointer-events-none"></div>
      
      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="z-10 w-full max-w-xs"
      >
        <div className="mb-6 flex items-center justify-center">
            <div className="w-20 h-20 rounded-full bg-zinc-900 border border-[var(--accent)] flex items-center justify-center relative shadow-[0_0_25px_var(--accent-glow)]">
                <Target className="text-[var(--accent)]" size={40} />
                <div className="absolute inset-0 border-2 border-[var(--accent)] opacity-20 rounded-full animate-ping"></div>
            </div>
        </div>
        
        <h1 className="text-3xl font-extrabold mb-2 tracking-tighter uppercase leading-none">
          {t('home.precision')}
        </h1>
        
        <p className="text-zinc-400 mb-6 max-w-xs mx-auto text-[11px] uppercase tracking-widest font-mono">
          PRECISION SHOOTING SYSTEM
        </p>

        <div className="mb-10">
          <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold mb-4">{t('settings.appearance')}</p>
          <div className="flex gap-3 justify-center">
            {(['dark', 'blue', 'red'] as const).map(themeVal => (
              <button
                key={themeVal}
                onClick={() => { triggerFeedback('click'); setTheme(themeVal); }}
                className={`w-10 h-10 rounded-full border-2 transition-all flex items-center justify-center ${theme === themeVal ? 'border-[var(--accent)] scale-110 shadow-[0_0_15px_var(--accent-glow)]' : 'border-white/10 opacity-60'}`}
                style={{ 
                  backgroundColor: 
                    themeVal === 'dark' ? '#0a0a0f' : 
                    themeVal === 'blue' ? '#001240' : '#330000' 
                }}
              >
                {theme === themeVal && <CheckCircle2 size={14} className="text-[var(--accent)]" />}
              </button>
            ))}
          </div>
        </div>
        
        <Button 
          onClick={handleLogin} 
          className="w-full mb-6 py-5 text-lg"
        >
          {t('general.enter')}
        </Button>

        <p className="text-[10px] text-zinc-600 uppercase font-bold tracking-widest">
          {t('settings.version')} 1.0.0
        </p>
      </motion.div>
    </div>
  );
};

const ClockContainer = () => {
  const [time, setTime] = useState(new Date());
  const { language } = useTheme();

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const locale = language === 'pt' ? 'pt-PT' : 'en-US';

  return (
    <div className="flex flex-col items-center">
      <div className="w-10 h-10 rounded-2xl bg-zinc-500/5 border border-[var(--border-color)] flex items-center justify-center mb-2">
        <Clock className="text-[var(--accent)]" size={20} />
      </div>
      <span className="text-xl font-bold font-mono text-[var(--accent)] tabular-nums">
        {time.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
      </span>
      <span className="text-[10px] uppercase tracking-tighter text-[var(--text-secondary)] font-bold">
        {time.toLocaleDateString(locale, { weekday: 'short', day: '2-digit', month: 'short' })}
      </span>
    </div>
  );
};

const ScheduleEventDialog = ({ isOpen, onClose, onSave }: { isOpen: boolean; onClose: () => void; onSave: (event: ScheduledEvent) => void }) => {
  const t = useTranslation();
  const [event, setEvent] = useState<ScheduledEvent>({
    name: '',
    type: 'training',
    date: new Date().toISOString().split('T')[0],
    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    weaponType: 'Pistola',
    notes: ''
  });

  const addToCalendar = () => {
    try {
      const [year, month, day] = event.date.split('-').map(n => parseInt(n));
      const [hour, minute] = event.time.split(':').map(n => parseInt(n));
      
      // Create Date objects
      const startDate = new Date(year, month - 1, day, hour, minute);
      // Default duration 1 hour
      const endDate = new Date(startDate.getTime() + 60 * 60 * 1000);

      const formatDate = (date: Date) => {
        return date.toISOString().replace(/-|:|\.\d+/g, '');
      };

      const icsContent = [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'PROID:-//Precision Shooting//EN',
        'BEGIN:VEVENT',
        `DTSTAMP:${formatDate(new Date())}`,
        `DTSTART:${formatDate(startDate)}`,
        `DTEND:${formatDate(endDate)}`,
        `SUMMARY:${event.name || (event.type === 'competition' ? 'Prova de Tiro' : 'Treino de Tiro')}`,
        `DESCRIPTION:Tipo: ${event.type}\nArma: ${event.weaponType}`,
        'STATUS:CONFIRMED',
        'SEQUENCE:0',
        'END:VEVENT',
        'END:VCALENDAR'
      ].join('\r\n');

      const isAndroid = /Android/i.test(navigator.userAgent);
      
      if (isAndroid) {
        // Google Calendar URL for Android
        const googleUrl = new URL('https://calendar.google.com/calendar/render');
        googleUrl.searchParams.append('action', 'TEMPLATE');
        googleUrl.searchParams.append('text', event.name || (event.type === 'competition' ? 'Prova de Tiro' : 'Treino de Tiro'));
        googleUrl.searchParams.append('dates', `${formatDate(startDate)}/${formatDate(endDate)}`);
        googleUrl.searchParams.append('details', `Tipo: ${event.type}\nArma: ${event.weaponType}`);
        window.open(googleUrl.toString(), '_blank');
      } else {
        // Apple/Other systems approach with ICS
        const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        // On iOS, not setting 'download' often triggers the native calendar app handler
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setTimeout(() => window.URL.revokeObjectURL(url), 100);
      }
    } catch (err) {
      console.error('Error generating calendar event:', err);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-10 bg-black/60 backdrop-blur-sm overflow-y-auto">
      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="w-full max-w-md bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-3xl p-4 shadow-2xl mb-10"
      >
        <h2 className="text-lg font-black uppercase tracking-tighter mb-3 text-[var(--text-primary)]">{t('training.addEvent')}</h2>
        
        <div className="space-y-2.5">
          <div>
            <label className="text-[10px] uppercase font-bold text-zinc-500 mb-1 block">{t('training.eventName')}</label>
            <input 
              type="text" 
              value={event.name}
              onChange={(e) => setEvent({ ...event, name: e.target.value })}
              className={`w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs outline-none transition-all ${event.type === 'competition' ? 'text-amber-500 focus:border-amber-500 placeholder:text-amber-500/20' : 'text-[var(--accent)] focus:border-[var(--accent)] placeholder:text-[var(--accent)]/20'}`}
              placeholder="Ex: Treino de Precisão"
            />
          </div>

          <div className="flex items-center justify-center gap-6 py-2">
            <div className="relative flex flex-col items-center">
              <label className="text-[10px] uppercase font-bold text-zinc-500 mb-1.5 block text-center">{t('training.eventDate')}</label>
              <div className={`w-20 h-20 rounded-full border-2 border-white/10 bg-white/5 flex flex-col items-center justify-center relative overflow-hidden transition-all shadow-lg ${event.type === 'competition' ? 'border-amber-500/40 bg-amber-500/10' : 'border-[var(--accent)]/40 bg-[var(--accent)]/10'}`}>
                <Calendar size={16} className={event.type === 'competition' ? 'text-amber-500' : 'text-[var(--accent)]'} />
                <span className={`text-[9px] font-mono mt-1 ${event.type === 'competition' ? 'text-amber-500' : 'text-[var(--accent)]'}`}>{event.date.split('-').reverse().slice(0, 2).join('/')}</span>
                <input 
                  type="date" 
                  value={event.date}
                  onChange={(e) => setEvent({ ...event, date: e.target.value })}
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                />
              </div>
            </div>

            <div className="relative flex flex-col items-center">
              <label className="text-[10px] uppercase font-bold text-zinc-500 mb-1.5 block text-center">{t('training.eventTime')}</label>
              <div className={`w-20 h-20 rounded-full border-2 border-white/10 bg-white/5 flex flex-col items-center justify-center relative overflow-hidden transition-all shadow-lg ${event.type === 'competition' ? 'border-amber-500/40 bg-amber-500/10' : 'border-[var(--accent)]/40 bg-[var(--accent)]/10'}`}>
                <Clock size={16} className={event.type === 'competition' ? 'text-amber-500' : 'text-[var(--accent)]'} />
                <span className={`text-[9px] font-mono mt-1 ${event.type === 'competition' ? 'text-amber-500' : 'text-[var(--accent)]'}`}>{event.time}</span>
                <input 
                  type="time" 
                  value={event.time}
                  onChange={(e) => setEvent({ ...event, time: e.target.value })}
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="text-[10px] uppercase font-bold text-zinc-500 mb-1 block">Tipo</label>
            <div className="grid grid-cols-2 gap-2">
               <button 
                onClick={() => setEvent({ ...event, type: 'training' })}
                className={`py-1.5 rounded-xl border text-[9px] font-bold uppercase transition-all ${event.type === 'training' ? 'border-[var(--accent)] bg-[var(--accent)]/10 text-[var(--accent)]' : 'border-white/5 bg-white/5 text-zinc-500'}`}
               >
                 {t('nav.record')}
               </button>
               <button 
                onClick={() => setEvent({ ...event, type: 'competition' })}
                className={`py-1.5 rounded-xl border text-[9px] font-bold uppercase transition-all ${event.type === 'competition' ? 'border-amber-500 bg-amber-500/10 text-amber-500' : 'border-white/5 bg-white/5 text-zinc-500'}`}
               >
                 {t('training.competition')}
               </button>
            </div>
          </div>

          <div>
            <label className="text-[10px] uppercase font-bold text-zinc-500 mb-1 block">{t('training.weapon')}</label>
            <div className="grid grid-cols-2 gap-2">
               <button 
                onClick={() => setEvent({ ...event, weaponType: 'Pistola' })}
                className={`py-1.5 rounded-xl border text-[9px] font-bold uppercase transition-all ${event.weaponType === 'Pistola' ? 'border-[var(--accent)] bg-[var(--accent)]/10 text-[var(--accent)]' : 'border-white/5 bg-white/5 text-zinc-500'}`}
               >
                 {t('training.pistol')}
               </button>
               <button 
                onClick={() => setEvent({ ...event, weaponType: 'Carabina' })}
                className={`py-1.5 rounded-xl border text-[9px] font-bold uppercase transition-all ${event.weaponType === 'Carabina' ? 'border-[var(--accent)] bg-[var(--accent)]/10 text-[var(--accent)]' : 'border-white/5 bg-white/5 text-zinc-500'}`}
               >
                 {t('training.rifle')}
               </button>
            </div>
          </div>

          <div className="pt-2">
            <button 
                onClick={() => {
                  addToCalendar();
                  onSave(event);
                }}
                className="w-full py-2.5 rounded-xl border border-pink-500/30 bg-pink-500/10 text-pink-500 text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all active:scale-95 shadow-[0_4px_12px_rgba(236,72,153,0.1)]"
            >
                <Bell size={12} strokeWidth={3} />
                Adicionar ao Calendário
            </button>
          </div>
        </div>

        <div className="flex gap-2 mt-5">
           <button 
            onClick={onClose}
            className="w-full py-2 text-[10px] font-bold uppercase tracking-widest text-zinc-500 bg-white/5 rounded-xl border border-white/5"
           >
             {t('general.cancel')}
           </button>
        </div>
      </motion.div>
    </div>
  );
};

const HomeScreen = ({ onNavigate }: { onNavigate: (page: string, params?: any) => void }) => {
  const { user } = useAuth();
  const [stats, setStats] = useState({ avg: 0, totalShots: 0, maxScore: 0, seriesRecord: 0, totalTrainings: 0, totalCompetitions: 0 });
  const [scheduledEvents, setScheduledEvents] = useState<ScheduledEvent[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const t = useTranslation();

  React.useEffect(() => {
    const fetchStats = async () => {
      try {
        const uid = user?.uid || 'atleta_local_01';
        const trainings = await trainingService.getUserTrainings(uid);
        if (trainings && trainings.length > 0) {
            const totalShots = trainings.reduce((acc, t) => acc + (Number(t.totalShots) || 0), 0);
            const sumScores = trainings.reduce((acc, t) => acc + (Number(t.totalScore) || 0), 0);
            const totalOfficialShots = trainings.reduce((acc, t) => acc + (Number(t.officialShots) || 0), 0);
            
            // Calculate personal best (max score in a single session)
            const maxScore = Math.max(...trainings.map(t => Number(t.totalScore) || 0));
            
            // Calculate series record (max score in a single series)
            let seriesRecord = 0;
            trainings.forEach(t => {
              if (t.series && t.series.length > 0) {
                t.series.forEach(s => {
                  if (!s.isWarmup && s.score > seriesRecord) {
                    seriesRecord = s.score;
                  }
                });
              }
            });

            const avgOverall = totalOfficialShots > 0 ? (sumScores / totalOfficialShots) : 0;

            const totalTrainings = trainings.filter(t => t.sessionType !== 'competition').length;
            const totalCompetitions = trainings.filter(t => t.sessionType === 'competition').length;

            setStats({
              avg: parseFloat(avgOverall.toFixed(2)),
              totalShots,
              maxScore,
              seriesRecord,
              totalTrainings,
              totalCompetitions
            });
          }
      } catch (e) {
        console.error("Error fetching stats:", e);
      }
    };

    const fetchEvents = async () => {
      const events = await eventService.getScheduledEvents();
      setScheduledEvents(events);
    };

    fetchStats();
    fetchEvents();
  }, [user]);

  const handleSaveEvent = async (event: ScheduledEvent) => {
    await eventService.saveEvent(event);
    const updated = await eventService.getScheduledEvents();
    setScheduledEvents(updated);
    setIsDialogOpen(false);
  };

  const handleDeleteEvent = async (id: string | undefined) => {
    if (!id) return;
    triggerFeedback('warning');
    await eventService.deleteEvent(id);
    const updated = await eventService.getScheduledEvents();
    setScheduledEvents(updated);
  };

  return (
    <div className="p-3 pb-40">
      <Header 
        title={t('nav.home')} 
        rightElement={
          <button onClick={() => { triggerFeedback('click'); onNavigate('settings'); }} className="p-2 rounded-full bg-zinc-500/5 border border-[var(--border-color)]">
            <Settings size={18} className="text-[var(--text-secondary)]" />
          </button>
        }
      />
      
      <div className="grid grid-cols-1 gap-3 mb-6">
        <Card className="relative overflow-hidden group">
          <div className="absolute -right-8 -bottom-8 opacity-5 group-hover:scale-110 transition-transform">
            <Target size={140} />
          </div>
          <p className="text-xs text-[var(--text-secondary)] uppercase tracking-widest mb-1 font-mono">{t('home.welcome')}</p>
          <h2 className="text-2xl font-bold mb-5 text-[var(--text-primary)]">{t('home.precision')}</h2>
          <div className="flex flex-col gap-2">
            <Button onClick={() => onNavigate('new-training', { type: 'training' })} icon={Plus} className="w-full">
              {t('home.newTraining')}
            </Button>
            <Button onClick={() => onNavigate('new-training', { type: 'competition' })} icon={Trophy} className="w-full bg-amber-500/10 border-amber-500/20 text-amber-500 hover:bg-amber-500/20">
              {t('home.newCompetition')}
            </Button>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <button onClick={() => { triggerFeedback('click'); onNavigate('history'); }} className="flex flex-col items-center justify-center p-5 rounded-3xl bg-[var(--bg-secondary)] border border-[var(--border-color)] hover:border-[var(--accent)]/30 transition-all group">
          <div className="w-10 h-10 rounded-2xl bg-zinc-500/5 border border-[var(--border-color)] flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
            <Trophy className="text-amber-500 group-hover:text-amber-400" size={20} />
          </div>
          
          <div className="flex flex-col items-center gap-2">
            <div className="flex flex-col items-center">
              <span className="text-[9px] uppercase tracking-tighter text-zinc-500 font-bold leading-none mb-1">{t('home.maxScore')}</span>
              <span className="text-xl font-black font-mono text-amber-500 leading-none">{stats.maxScore}</span>
            </div>
            <div className="h-[1px] w-8 bg-zinc-800" />
            <div className="flex flex-col items-center">
              <span className="text-[10px] font-black font-mono text-[var(--accent)] leading-none">{stats.seriesRecord}</span>
            </div>
          </div>
        </button>

        <div className="flex flex-col items-center justify-center p-5 rounded-3xl bg-[var(--bg-secondary)] border border-[var(--border-color)] transition-all">
          <ClockContainer />
        </div>
      </div>

      <div className="mt-8">
        <h3 className="text-xs uppercase tracking-widest text-[var(--text-secondary)] font-bold mb-4 px-2">{t('home.statistics')}</h3>
        <Card className="grid grid-cols-2 gap-4">
           <div className="bg-white/5 p-3 rounded-lg border border-white/5">
             <span className="text-[10px] text-[var(--text-secondary)] block mb-1 uppercase tracking-tighter truncate font-bold">{t('home.totalTrainings')}</span>
             <span className="text-xl font-bold font-mono text-blue-400">{stats.totalTrainings}</span>
           </div>
           <div className="bg-white/5 p-3 rounded-lg border border-white/5">
             <span className="text-[10px] text-[var(--text-secondary)] block mb-1 uppercase tracking-tighter truncate font-bold">{t('home.totalCompetitions')}</span>
             <span className="text-xl font-bold font-mono text-amber-500">{stats.totalCompetitions}</span>
           </div>
           <div className="bg-white/5 p-3 rounded-lg border border-white/5">
             <span className="text-[10px] text-[var(--text-secondary)] block mb-1 uppercase tracking-tighter truncate font-bold">{t('home.avgOverall')}</span>
             <span className="text-xl font-bold font-mono text-[var(--accent)]">{stats.avg}</span>
           </div>
           <div className="bg-white/5 p-3 rounded-lg border border-white/5">
             <span className="text-[10px] text-[var(--text-secondary)] block mb-1 uppercase tracking-tighter truncate font-bold">{t('home.totalShots')}</span>
             <span className="text-xl font-bold font-mono text-[var(--text-primary)]">{stats.totalShots.toLocaleString()}</span>
           </div>
        </Card>
      </div>

      <div className="mt-8">
        <div className="flex items-center justify-between mb-4 px-2">
          <h3 className="text-xs uppercase tracking-widest text-pink-500/80 font-black">{t('training.scheduledEvents')}</h3>
          <button 
            onClick={() => { triggerFeedback('click'); setIsDialogOpen(true); }}
            className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-pink-500/10 text-pink-500 text-[10px] font-black uppercase tracking-widest border border-pink-500/30 shadow-[0_0_15px_rgba(236,72,153,0.1)] active:scale-95 transition-all"
          >
            <Plus size={12} strokeWidth={3} />
            {t('training.addEvent')}
          </button>
        </div>
        
        <div className="space-y-3">
          {scheduledEvents.length === 0 ? (
            <Card className="py-8 text-center bg-[var(--bg-secondary)] border-dashed border-white/5">
               <Calendar size={28} className="mx-auto mb-3 text-zinc-700 opacity-20" />
               <p className="text-[10px] text-pink-500/40 uppercase font-bold tracking-widest">{t('training.noEvents')}</p>
            </Card>
          ) : (
            scheduledEvents.map(event => (
              <Card key={event.id} className="flex items-center justify-between py-3 group relative overflow-hidden">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${event.type === 'competition' ? 'bg-amber-500/10 text-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.1)]' : 'bg-[var(--accent)]/10 text-[var(--accent)] shadow-[0_0_15px_var(--accent-glow)]'}`}>
                    {event.type === 'competition' ? <Trophy size={18} /> : <Target size={18} />}
                  </div>
                  <div>
                    <h4 className="text-[13px] font-black text-[var(--text-primary)] uppercase tracking-tight">{event.name}</h4>
                    <div className="flex items-center gap-2 mt-0.5">
                      <div className="flex items-center gap-1">
                        <Calendar size={10} className="text-zinc-500" />
                        <span className="text-[9px] text-zinc-500 uppercase font-black tracking-tighter">{new Date(event.date).toLocaleDateString()}</span>
                      </div>
                      {event.time && (
                        <div className="flex items-center gap-1">
                          <Clock size={10} className="text-zinc-500" />
                          <span className="text-[9px] text-zinc-500 uppercase font-black tracking-tighter">{event.time}</span>
                        </div>
                      )}
                      <span className="w-1 h-1 rounded-full bg-zinc-700"></span>
                      <span className={`text-[9px] uppercase font-black tracking-tighter ${event.type === 'competition' ? 'text-amber-500' : 'text-[var(--accent)]'}`}>{event.weaponType}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                   <button 
                     onClick={() => { triggerFeedback('warning'); handleDeleteEvent(event.id); }}
                     className="p-2 text-zinc-700 hover:text-red-500 transition-colors"
                   >
                     <Trash2 size={16} />
                   </button>
                </div>
              </Card>
            ))
          )}
        </div>
      </div>

      <AdBanner />
      <div className="h-20" />

      <ScheduleEventDialog 
        isOpen={isDialogOpen} 
        onClose={() => setIsDialogOpen(false)} 
        onSave={handleSaveEvent} 
      />
    </div>
  );
};

const NewTrainingScreen = ({ onNavigate, onStart, defaultTarget, initialType }: { onNavigate: (page: string, params?: any) => void; onStart: (config: any) => void; defaultTarget: number; initialType?: 'training' | 'competition' }) => {
  const t = useTranslation();
  const [config, setConfig] = useState({
    warmup: true,
    series: 6,
    shotsPerSeries: 5,
    timer: 300, // seconds
    targetPoints: defaultTarget,
    weapon: 'Pistola',
    caliber: '4.5mm',
    distance: `10 ${t('general.meters')}`,
    targetType: 'ISSF',
    ammoBrand: '',
    weaponModel: '',
    customCaliber: '',
    customDistance: '',
    competitionName: '',
    sessionType: initialType || 'training'
  });

  const [showCustomCaliber, setShowCustomCaliber] = useState(false);
  const [showCustomDistance, setShowCustomDistance] = useState(false);

  const calibers = ['4.5mm', '5.5mm', '9mm', '.22'];
  const distances = [`10 ${t('general.meters')}`, `25 ${t('general.meters')}`, `50 ${t('general.meters')}`];

  const handleStart = () => {
    const finalConfig = {
      ...config,
      caliber: showCustomCaliber ? config.customCaliber : config.caliber,
      distance: showCustomDistance ? config.customDistance : config.distance
    };
    
    // Update global target if changed
    if (config.targetPoints !== defaultTarget) {
      localStorage.setItem('precision_global_target', config.targetPoints.toString());
    }
    
    onStart(finalConfig);
  };

  return (
    <div className="p-3 pb-40">
      <Header title={config.sessionType === 'competition' ? t('home.newCompetition') : t('training.new')} onBack={() => onNavigate('home')} />
      
      <div className="space-y-5">
        <section>
          <label className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold mb-2 block px-2">{t('training.baseConfig')}</label>
          <Card className="space-y-3">
            {config.sessionType === 'competition' && (
              <div className="flex flex-col gap-1.5 pb-2 border-b border-white/5">
                <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-tight px-1">{t('training.competitionName')}</span>
                <input 
                  type="text" 
                  value={config.competitionName}
                  onChange={(e) => setConfig({...config, competitionName: e.target.value})}
                  placeholder="Ex: Campeonato Nacional, Taça de Portugal..."
                  className="w-full bg-white/5 rounded-lg border border-white/10 px-3 py-2 text-sm outline-none focus:border-amber-500"
                />
              </div>
            )}
            <div className="flex items-center justify-between py-1.5 border-b border-white/5">
              <span className="text-sm text-zinc-300">{t('training.warmup')}</span>
              <button 
                onClick={() => { triggerFeedback('click'); setConfig({ ...config, warmup: !config.warmup }); }}
                className={`w-10 h-5 rounded-full transition-colors relative ${config.warmup ? (config.sessionType === 'competition' ? 'bg-amber-500' : 'bg-[var(--accent)]') : 'bg-zinc-800'}`}
              >
                <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${config.warmup ? 'left-5.5' : 'left-0.5'}`}></div>
              </button>
            </div>
            <div className="flex items-center justify-between py-1.5 border-b border-white/5">
              <span className="text-sm text-zinc-300">{t('training.numSeries')}</span>
              <div className="flex items-center gap-3">
                <button onClick={() => { triggerFeedback('click'); setConfig({...config, series: Math.max(1, config.series - 1)}); }} className="w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center transition-colors active:bg-white/10">-</button>
                <span className={`font-mono font-bold w-4 text-center ${config.sessionType === 'competition' ? 'text-amber-500' : 'text-[var(--accent)]'}`}>{config.series}</span>
                <button onClick={() => { triggerFeedback('click'); setConfig({...config, series: config.series + 1}); }} className="w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center transition-colors active:bg-white/10">+</button>
              </div>
            </div>
            <div className="flex items-center justify-between py-1.5 border-b border-white/5">
              <div className="flex flex-col">
                <span className="text-sm text-zinc-300">{t('training.shotsPerSeries')}</span>
                <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-tight">{t('training.totalShots', { count: config.series * config.shotsPerSeries })}</span>
              </div>
              <div className="flex items-center gap-3">
                <button onClick={() => { triggerFeedback('click'); setConfig({...config, shotsPerSeries: Math.max(1, config.shotsPerSeries - 1)}); }} className="w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center transition-colors active:bg-white/10">-</button>
                <span className={`font-mono font-bold w-4 text-center ${config.sessionType === 'competition' ? 'text-amber-500' : 'text-[var(--accent)]'}`}>{config.shotsPerSeries}</span>
                <button onClick={() => { triggerFeedback('click'); setConfig({...config, shotsPerSeries: config.shotsPerSeries + 1}); }} className="w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center transition-colors active:bg-white/10">+</button>
              </div>
            </div>
            <div className="flex items-center justify-between py-1.5 border-b border-white/5 text-xs">
                <span className="text-zinc-300">{t('training.timePerSeries')}</span>
                <input 
                  type="number" 
                  value={config.timer}
                  onChange={(e) => setConfig({...config, timer: parseInt(e.target.value) || 0})}
                  className={`w-16 bg-white/5 rounded-lg border border-white/10 px-2 py-1 text-right font-mono ${config.sessionType === 'competition' ? 'text-amber-500' : 'text-[var(--accent)]'}`}
                />
            </div>
            <div className="flex items-center justify-between py-1.5 text-xs">
                <span className="text-zinc-300">{t('training.scoreGoal')}</span>
                <input 
                  type="number" 
                  value={config.targetPoints}
                  onChange={(e) => setConfig({...config, targetPoints: parseInt(e.target.value) || 0})}
                  className={`w-16 bg-white/5 rounded-lg border border-white/10 px-2 py-1 text-right font-mono ${config.sessionType === 'competition' ? 'text-amber-500' : 'text-[var(--accent)]'}`}
                />
            </div>
          </Card>
        </section>

        <section>
          <label className="text-xs uppercase tracking-widest text-[var(--text-secondary)] font-bold mb-3 block px-2">{t('training.equipmentAmmo')}</label>
          <Card className="space-y-4">
             <div className="flex flex-col gap-2">
                <span className="text-xs text-[var(--text-secondary)] ml-1">{t('training.weapon')}</span>
                <div className="grid grid-cols-2 gap-2">
                   {[
                     { label: t('training.pistol'), value: 'Pistola' },
                     { label: t('training.rifle'), value: 'Carabina' }
                   ].map(w => (
                     <button 
                       key={w.value}
                       onClick={() => { triggerFeedback('click'); setConfig({...config, weapon: w.value}); }}
                       className={`py-3 rounded-xl border text-sm font-medium transition-all ${config.weapon === w.value ? (config.sessionType === 'competition' ? 'border-amber-500 bg-amber-500/10 text-amber-500' : 'border-[var(--accent)] bg-[var(--accent)]/10 text-[var(--accent)]') : 'border-[var(--border-color)] bg-zinc-500/5 text-[var(--text-secondary)]'}`}
                     >
                       {w.label}
                     </button>
                   ))}
                </div>
             </div>

             <div className="flex flex-col gap-2">
                <span className="text-xs text-[var(--text-secondary)] ml-1">{t('training.caliber')}</span>
                <div className="grid grid-cols-3 gap-2">
                   {calibers.map(c => (
                     <button 
                       key={c}
                       onClick={() => {
                         triggerFeedback('click'); setConfig({...config, caliber: c});
                         setShowCustomCaliber(false);
                       }}
                       className={`py-2 rounded-lg border text-[10px] font-bold transition-all ${!showCustomCaliber && config.caliber === c ? (config.sessionType === 'competition' ? 'border-amber-500 bg-amber-500/20 text-amber-500' : 'border-[var(--accent)] bg-[var(--accent)]/20 text-[var(--accent)]') : 'border-[var(--border-color)] bg-zinc-500/5 text-[var(--text-secondary)]'}`}
                     >
                       {c}
                     </button>
                   ))}
                   <button 
                      onClick={() => { triggerFeedback('click'); setShowCustomCaliber(true); }}
                      className={`py-2 rounded-lg border text-[10px] font-bold transition-all ${showCustomCaliber ? (config.sessionType === 'competition' ? 'border-amber-500 bg-amber-500/20 text-amber-500' : 'border-[var(--accent)] bg-[var(--accent)]/20 text-[var(--accent)]') : 'border-[var(--border-color)] bg-zinc-500/5 text-[var(--text-secondary)]'}`}
                   >
                      {t('training.customize')}
                   </button>
                </div>
                {showCustomCaliber && (
                  <input 
                    type="text"
                    value={config.customCaliber}
                    onChange={(e) => setConfig({...config, customCaliber: e.target.value})}
                    placeholder={t('training.caliber') + "..."}
                    className={`w-full bg-zinc-500/5 rounded-lg border border-[var(--border-color)] px-3 py-2 text-sm mt-1 text-[var(--text-primary)] outline-none ${config.sessionType === 'competition' ? 'focus:border-amber-500' : 'focus:border-[var(--accent)]'}`}
                  />
                )}
             </div>

             <div className="flex flex-col gap-2">
                <span className="text-xs text-zinc-500 ml-1">{t('training.weaponModel')}</span>
                <input 
                  type="text"
                  value={config.weaponModel}
                  onChange={(e) => setConfig({...config, weaponModel: e.target.value})}
                  placeholder="Ex: Walther LP500, Pardini..."
                  className={`w-full bg-white/5 rounded-lg border border-white/10 px-3 py-2 text-sm outline-none ${config.sessionType === 'competition' ? 'focus:border-amber-500' : 'focus:border-[var(--accent)]'}`}
                />
             </div>

             <div className="flex flex-col gap-2">
                <span className="text-xs text-zinc-500 ml-1">{t('training.ammoBrand')}</span>
                <input 
                  type="text"
                  value={config.ammoBrand}
                  onChange={(e) => setConfig({...config, ammoBrand: e.target.value})}
                  placeholder="Ex: RWS, Lapua, JSB..."
                  className={`w-full bg-white/5 rounded-lg border border-white/10 px-3 py-2 text-sm outline-none ${config.sessionType === 'competition' ? 'focus:border-amber-500' : 'focus:border-[var(--accent)]'}`}
                />
             </div>
          </Card>
        </section>

        <section>
          <label className="text-xs uppercase tracking-widest text-zinc-500 font-bold mb-3 block px-2">{t('training.distance')} & {t('training.targetType')}</label>
          <Card className="space-y-4">
             <div className="flex flex-col gap-2">
                <span className="text-xs text-zinc-500 ml-1">{t('training.distance')}</span>
                <div className="grid grid-cols-2 gap-2">
                   {distances.map(d => (
                     <button 
                       key={d}
                       onClick={() => {
                         triggerFeedback('click'); setConfig({...config, distance: d});
                         setShowCustomDistance(false);
                       }}
                       className={`py-2 rounded-lg border text-[10px] font-bold transition-all ${!showCustomDistance && config.distance === d ? (config.sessionType === 'competition' ? 'border-amber-500 bg-amber-500/20 text-amber-500' : 'border-[var(--accent)] bg-[var(--accent)]/20 text-[var(--accent)]') : 'border-white/5 bg-white/5 text-zinc-400'}`}
                     >
                       {d}
                     </button>
                   ))}
                   <button 
                      onClick={() => { triggerFeedback('click'); setShowCustomDistance(true); }}
                      className={`py-2 rounded-lg border text-[10px] font-bold transition-all ${showCustomDistance ? (config.sessionType === 'competition' ? 'border-amber-500 bg-amber-500/20 text-amber-500' : 'border-[var(--accent)] bg-[var(--accent)]/20 text-[var(--accent)]') : 'border-white/5 bg-white/5 text-zinc-400'}`}
                   >
                      {t('training.customize')}
                   </button>
                </div>
                {showCustomDistance && (
                  <input 
                    type="text"
                    value={config.customDistance}
                    onChange={(e) => setConfig({...config, customDistance: e.target.value})}
                    placeholder={t('training.distance') + "..."}
                    className={`w-full bg-white/5 rounded-lg border border-white/10 px-3 py-2 text-sm mt-1 outline-none ${config.sessionType === 'competition' ? 'focus:border-amber-500' : 'focus:border-[var(--accent)]'}`}
                  />
                )}
             </div>
          </Card>
        </section>

        <Button 
          onClick={handleStart} 
          className={`w-full h-16 mt-4 transition-all ${config.sessionType === 'competition' ? 'bg-amber-500 text-black shadow-[0_0_30px_rgba(245,158,11,0.4)]' : 'shadow-[0_0_30px_var(--accent-glow)]'}`}
        >
          {config.sessionType === 'competition' ? t('training.startCompetition') : t('training.start')}
        </Button>
      </div>
      <div className="h-20" />
    </div>
  );
};

const ActiveTrainingScreen = ({ config, onFinish, onCancel }: { config: any; onFinish: (results: any) => void; onCancel: () => void }) => {
  const t = useTranslation();
  const [currentSeries, setCurrentSeries] = useState(1);
  const [currentShot, setCurrentShot] = useState(1);
  const [isWarmup, setIsWarmup] = useState(config.warmup);
  const [shotsInSeries, setShotsInSeries] = useState<number[]>([]);
  const [allSeries, setAllSeries] = useState<any[]>([]);
  const [timeLeft, setTimeLeft] = useState(config.timer);
  const [isRunning, setIsRunning] = useState(true);
  const [showConfirmFinish, setShowConfirmFinish] = useState(false);
  const [finalResults, setFinalResults] = useState<any>(null);
  
  React.useEffect(() => {
    let interval: any;
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev: number) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isRunning) {
      setIsRunning(false);
      // Optional: Sound/vibration
    }
    return () => clearInterval(interval);
  }, [isRunning, timeLeft]);

  const handleScore = (points: number) => {
    // Feedback tátil e sonoro discreto
    triggerFeedback('click');
    const newShots = [...shotsInSeries, points];
    setShotsInSeries(newShots);
    
    // Stop timer if it's the last shot of the series
    if (newShots.length === config.shotsPerSeries) {
      setIsRunning(false);
    }
    
    if (currentShot < config.shotsPerSeries) {
      setCurrentShot(currentShot + 1);
    } else {
        // End of series
    }
  };

  const deleteLastShot = () => {
    if (shotsInSeries.length > 0) {
        // Feedback tátil e sonoro ao apagar
        triggerFeedback('warning');
        const newShots = [...shotsInSeries];
        newShots.pop();
        setShotsInSeries(newShots);
        setCurrentShot(currentShot - 1);
    }
  };

  const nextSeries = () => {
    triggerFeedback('success');
    const seriesTotal = shotsInSeries.reduce((a, b) => a + b, 0);
    const seriesAvg = shotsInSeries.length > 0 ? seriesTotal / shotsInSeries.length : 0;
    
    const seriesData = {
        shots: [...shotsInSeries],
        score: seriesTotal,
        average: parseFloat(seriesAvg.toFixed(2)),
        isWarmup: isWarmup
    };

    const updatedAllSeries = [...allSeries, seriesData];
    setAllSeries(updatedAllSeries);
    
    if (isWarmup) {
      setIsWarmup(false);
      setCurrentShot(1);
      setShotsInSeries([]);
      setTimeLeft(config.timer);
      setIsRunning(true);
    } else if (currentSeries < config.series) {
      setCurrentSeries(currentSeries + 1);
      setCurrentShot(1);
      setShotsInSeries([]);
      setTimeLeft(config.timer);
      setIsRunning(true);
    } else {
      // Final Finish - Prepare results
      const finalData = updatedAllSeries;
      const officialSeries = finalData.filter(s => !s.isWarmup);
      const totalScore = officialSeries.reduce((a, b) => a + b.score, 0);
      
      // Calculate total shots including warmup
      const totalShotsCount = finalData.reduce((acc, s) => acc + s.shots.length, 0);
      const officialShotsCount = officialSeries.reduce((acc, s) => acc + s.shots.length, 0);
      
      const avgShot = officialShotsCount > 0 ? totalScore / officialShotsCount : 0;
      
      const resData = {
          date: new Date().toISOString(),
          totalScore,
          averageScore: parseFloat(avgShot.toFixed(2)),
          totalShots: totalShotsCount,
          officialShots: officialShotsCount,
          weaponType: config.weapon,
          caliber: config.caliber,
          distance: config.distance,
          targetType: config.targetType || 'ISSF',
          series: finalData,
          targetPoints: config.targetPoints || 0,
          ammoBrand: config.ammoBrand || '',
          weaponModel: config.weaponModel || '',
          numSeries: config.series,
          shotsPerSeries: config.shotsPerSeries,
          sessionType: config.sessionType || 'training',
          competitionName: config.competitionName || '',
          notes: ''
      };
      
      setFinalResults(resData);
      setShowConfirmFinish(true);
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 8) return 'bg-[var(--success)]';
    if (score >= 6) return 'bg-[var(--warning)]';
    return 'bg-[var(--danger)]';
  };

  const getScoreColor = (score: number) => {
    if (score >= 8) return 'text-[var(--success)]';
    if (score >= 6) return 'text-[var(--warning)]';
    return 'text-[var(--danger)]';
  };

  return (
    <div className="flex flex-col bg-[var(--bg-primary)]">
      <div className="px-3 py-2 bg-[var(--bg-secondary)] border-b border-[var(--border-color)] flex items-center justify-between">
        <div className="flex items-center gap-2">
            <Target size={14} className={config.sessionType === 'competition' ? "text-amber-500" : "text-[var(--accent)]"} />
            <span className={`text-[9px] uppercase tracking-widest font-bold ${config.sessionType === 'competition' ? "text-amber-500" : "text-[var(--text-secondary)]"}`}>
              {config.sessionType === 'competition' ? t('training.activeCompetition') : t('training.active')}
            </span>
        </div>
        <button 
          onClick={() => { triggerFeedback('click'); onCancel(); }}
          className="relative z-[100] text-red-500 text-[9px] font-bold uppercase tracking-widest border border-red-500/20 px-3 py-1 rounded-full bg-red-500/5 hover:bg-red-500/10 active:scale-95 transition-all"
        >
          {t('history.exit')}
        </button>
      </div>

      <div className="p-3 bg-[var(--bg-secondary)] border-b border-[var(--border-color)]">
        <div className="flex items-center justify-between mb-3">
           <div>
             <p className="text-[9px] uppercase tracking-widest text-[var(--text-secondary)] font-bold mb-1">{t('training.rounds')}</p>
             <h2 className="text-xl font-mono font-bold leading-none text-[var(--text-primary)]">
                {isWarmup ? <span className="text-[var(--accent)]">A</span> : currentSeries} 
                <span className="text-xs text-[var(--text-secondary)] opacity-50"> / {config.series}</span>
             </h2>
           </div>
           <div className="text-center group relative">
             <div className="flex items-center gap-2 mb-1 justify-center">
                <Timer size={12} className="text-[var(--text-secondary)]" />
                <span className="text-[9px] uppercase tracking-widest text-[var(--text-secondary)] font-bold">{t('training.time')}</span>
             </div>
             <div className="relative inline-flex items-center gap-3">
                 <div className={`text-2xl font-mono font-bold leading-none ${timeLeft < 10 && isRunning ? 'text-red-500 animate-pulse' : 'text-[var(--text-primary)]'}`}>
                    {formatTime(timeLeft)}
                 </div>
                 <button 
                  onClick={() => { triggerFeedback('click'); setIsRunning(!isRunning); }}
                  className={`w-7 h-7 rounded-full flex items-center justify-center transition-all ${isRunning ? 'bg-zinc-500/10 text-[var(--text-secondary)]' : 'bg-[var(--accent)] text-white shadow-lg'}`}
                  title={isRunning ? t('general.pause') : t('general.continue')}
                 >
                    {isRunning ? <Pause size={12} fill="currentColor" /> : <Play size={12} fill="currentColor" />}
                 </button>
             </div>
           </div>
           <div className="text-right">
             <p className="text-[9px] uppercase tracking-widest text-[var(--text-secondary)] font-bold mb-1">{t('training.shots')}</p>
             <h2 className="text-xl font-mono font-bold leading-none text-[var(--text-primary)]">{currentShot} <span className="text-xs text-[var(--text-secondary)] opacity-50">/ {config.shotsPerSeries}</span></h2>
           </div>
        </div>
        
        <div className="flex gap-2 justify-center mb-2">
            {Array.from({ length: config.shotsPerSeries }).map((_, i) => {
                const shotScore = shotsInSeries[i];
                const hasShot = i < shotsInSeries.length;
                return (
                    <div 
                        key={i} 
                        className={`h-1.5 flex-1 rounded-full transition-colors duration-300 ${hasShot ? getScoreBgColor(shotScore) : 'bg-[var(--border-color)]'}`}
                    />
                );
            })}
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-8 bg-[var(--bg-primary)] relative">
         <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 opacity-5 pointer-events-none">
            <Crosshair size={320} className="text-[var(--accent)]" />
         </div>

         {shotsInSeries.length > 0 ? (
           <motion.div 
            key={shotsInSeries.length}
            initial={{ scale: 1.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="z-10"
           >
             <span className={`text-9xl font-mono font-black drop-shadow-2xl ${getScoreColor(shotsInSeries[shotsInSeries.length - 1])}`}>
                {shotsInSeries[shotsInSeries.length - 1]}
             </span>
           </motion.div>
         ) : (
           <div className="z-10 text-center">
             <Target size={120} className="text-[var(--text-secondary)] opacity-20 mb-4 mx-auto" />
             <p className="text-[var(--text-secondary)] uppercase tracking-widest text-xs font-bold">{t('training.waitingShot')}</p>
           </div>
         )}
      </div>

      <div className="bg-[var(--bg-secondary)] p-4 border-t border-[var(--border-color)] relative z-50">
        {showConfirmFinish ? (
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
                <Button 
                    onClick={() => onFinish(finalResults)} 
                    className="w-full h-20 shadow-[0_0_30px_var(--accent-glow)] text-xl uppercase tracking-widest font-black"
                >
                    {t('results.showResults')}
                </Button>
            </motion.div>
        ) : shotsInSeries.length === config.shotsPerSeries ? (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
               <Card className="mb-4 bg-[var(--accent)]/10 border-[var(--accent)]/20 p-4">
                  <div className="flex justify-between items-center">
                    <div>
                        <span className="text-[10px] uppercase tracking-widest text-[var(--text-secondary)] font-bold block mb-1">{t('results.success')}</span>
                        <span className="text-2xl font-mono font-bold text-[var(--text-primary)]">{t('results.totalPoints')}: {shotsInSeries.reduce((a,b)=>a+b,0)} {t('general.pts')}</span>
                    </div>
                    <Button onClick={nextSeries} className="py-2.5 px-4 shadow-none">
                        {t('results.next')}
                    </Button>
                  </div>
               </Card>
            </motion.div>
        ) : (
            <>
                <div className="grid grid-cols-5 gap-2 mb-4">
                {[0, 1, 2, 3, 4].map(score => (
                    <button 
                        key={score}
                        onClick={() => handleScore(score)}
                        className="h-14 sm:h-16 rounded-xl bg-zinc-500/5 border border-[var(--border-color)] active:scale-95 transition-transform flex items-center justify-center text-xl font-bold font-mono text-[var(--text-primary)]"
                    >
                        {score}
                    </button>
                ))}
                {[5, 6, 7, 8, 9].map(score => (
                    <button 
                        key={score}
                        onClick={() => handleScore(score)}
                        className={`h-14 sm:h-16 rounded-xl bg-zinc-500/5 border border-[var(--border-color)] active:scale-95 transition-transform flex items-center justify-center text-xl font-bold font-mono text-[var(--text-primary)] ${score >= 8 ? 'text-[var(--accent)]' : ''}`}
                    >
                        {score}
                    </button>
                ))}
                </div>
                <div className="flex items-center gap-2">
                    <button 
                        onClick={() => { triggerFeedback('success'); handleScore(10); }}
                        className="flex-[3] h-16 rounded-xl bg-zinc-500/5 border-2 border-[var(--accent)] font-mono font-black text-2xl text-[var(--accent)] shadow-[0_0_15px_var(--accent-glow)]/30 active:scale-95 transition-transform"
                    >
                        10
                    </button>
                    <button 
                        onClick={() => { triggerFeedback('warning'); deleteLastShot(); }}
                        disabled={shotsInSeries.length === 0}
                        className="flex-1 h-16 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-500 active:scale-95 transition-transform disabled:opacity-30"
                    >
                        <Trash2 size={24} />
                    </button>
                </div>
            </>
        )}
      </div>
    </div>
  );
};

const ResultsScreen = ({ results, onDone }: { results: TrainingSession | null; onDone: () => void }) => {
    const t = useTranslation();
    if (!results) return (
        <div className="flex flex-col items-center justify-center p-12 bg-[var(--bg-primary)]">
            <p className="text-[var(--text-secondary)] mb-6">{t('general.loading')}</p>
            <Button onClick={onDone}>{t('general.back')}</Button>
        </div>
    );

    const targetPoints = results.targetPoints || 0;
    const isSuccess = targetPoints > 0 && results.totalScore >= targetPoints;
    const isNear = targetPoints > 0 && !isSuccess && results.totalScore >= (targetPoints * 0.75);
    const progress = targetPoints > 0 ? Math.min(100, Math.round((results.totalScore / targetPoints) * 100)) : 0;
    
    // Determine the main message and mood
    let title = t('results.title');
    let subtitle = t('results.subtitle');
    let moodColor = 'text-[var(--accent)]';
    let moodBg = 'bg-[var(--accent)]/10 border-[var(--accent)]';
    let moodShadow = 'shadow-[0_0_40px_var(--accent-glow)]';
    let barBg = 'bg-[var(--accent)]';

    if (targetPoints > 0) {
        if (isSuccess) {
            title = t('results.success');
            subtitle = t('results.reached');
            moodColor = 'text-[var(--success)]';
            moodBg = 'bg-[var(--success)]/10 border-[var(--success)]';
            moodShadow = 'shadow-[0_0_40px_rgba(34,197,94,0.3)]';
            barBg = 'bg-[var(--success)]';
        } else if (isNear) {
            title = t('results.almost');
            subtitle = t('results.almost');
            moodColor = 'text-yellow-500';
            moodBg = 'bg-yellow-500/10 border-yellow-500';
            moodShadow = 'shadow-[0_0_40px_rgba(234,179,8,0.3)]';
            barBg = 'bg-yellow-500';
        } else {
            title = t('results.focus');
            subtitle = t('results.focus');
            moodColor = 'text-red-500';
            moodBg = 'bg-red-500/10 border-red-500';
            moodShadow = 'shadow-[0_0_40px_rgba(239,68,68,0.3)]';
            barBg = 'bg-red-500';
        }
    }
    
    return (
        <div className="p-3 pb-40 bg-[var(--bg-primary)]">
             <div className="py-8 text-center">
                 {results.sessionType === 'competition' && results.competitionName && (
                   <div className="mb-4 inline-block px-3 py-1 rounded-lg bg-amber-500/10 border border-amber-500/20">
                     <span className="text-amber-500 font-black uppercase text-sm tracking-tight">{results.competitionName}</span>
                   </div>
                 )}
                 <motion.div 
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 ${moodShadow} ${moodBg}`}
                 >
                    <Trophy className={moodColor} size={40} />
                 </motion.div>
                 <h1 className={`text-2xl font-black mb-1 uppercase tracking-tighter ${moodColor}`}>
                    {results.sessionType === 'competition' ? t('results.titleCompetition') : t('results.title')}
                 </h1>
                 <p className={`text-xs font-bold mb-3 uppercase tracking-widest ${moodColor}`}>
                    {subtitle}
                 </p>
                 <p className="text-[var(--text-secondary)] uppercase tracking-widest text-[9px] font-bold font-mono">{new Date(results.date).toLocaleDateString()}</p>
             </div>

             <div className="grid grid-cols-2 gap-3 mb-5">
                <Card className="text-center">
                    <span className="text-[9px] uppercase tracking-widest text-[var(--text-secondary)] font-bold block mb-1">{t('results.totalPoints')}</span>
                    <span className={`text-3xl font-mono font-bold ${moodColor}`}>{results.totalScore}</span>
                </Card>
                <Card className="text-center">
                    <span className="text-[9px] uppercase tracking-widest text-[var(--text-secondary)] font-bold block mb-1">{t('results.avgShot')}</span>
                    <span className="text-3xl font-mono font-bold text-[var(--text-primary)]">{results.averageScore}</span>
                </Card>
             </div>

             {targetPoints > 0 && (
                <Card className="mb-5">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-[9px] uppercase tracking-widest text-zinc-500 font-bold">{t('results.progress')} ({targetPoints} {t('general.pts')})</span>
                        <span className={`text-xs font-bold ${moodColor}`}>{progress}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden">
                        <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${progress}%` }}
                            className={`h-full ${barBg}`}
                        />
                    </div>
                </Card>
             )}

             <div className="grid grid-cols-2 gap-4 mb-6">
                <Card className="text-center py-4">
                    <span className="text-[8px] uppercase tracking-widest text-zinc-500 font-bold block mb-1">{t('home.totalShots')}</span>
                    <span className="text-xl font-mono font-bold text-zinc-300">{results.totalShots}</span>
                </Card>
                <Card className="text-center py-4">
                    <span className="text-[8px] uppercase tracking-widest text-zinc-500 font-bold block mb-1">{t('training.numSeries')}</span>
                    <span className="text-xl font-mono font-bold text-zinc-300">
                        {results.numSeries || results.series.filter(s => !s.isWarmup).length}
                    </span>
                </Card>
             </div>

             <Card className="mb-8 space-y-4">
                <div className="flex justify-between text-sm py-2 border-b border-white/5">
                    <span className="text-zinc-500">{t('results.weapon')}</span>
                    <span className="font-medium text-right">{results.weaponType} {results.weaponModel && `(${results.weaponModel})`}</span>
                </div>
                <div className="flex justify-between text-sm py-2 border-b border-white/5">
                    <span className="text-zinc-500">{t('training.caliber')}</span>
                    <span className="font-medium">{results.caliber}</span>
                </div>
                <div className="flex justify-between text-sm py-2 border-b border-white/5">
                    <span className="text-zinc-500">{t('results.distance')}</span>
                    <span className="font-medium">{results.distance}</span>
                </div>
                {results.ammoBrand && (
                   <div className="flex justify-between text-sm py-2 border-b border-white/5">
                       <span className="text-zinc-500">{t('training.ammoBrand')}</span>
                       <span className="font-medium">{results.ammoBrand}</span>
                   </div>
                )}
                <div className="flex justify-between text-sm py-2">
                    <span className="text-zinc-500">{t('results.series')}</span>
                    <span className="font-medium text-right">
                        {results.series.filter(s => !s.isWarmup).length}
                        {results.series.some(s => s.isWarmup) && ` (+ ${t('results.warmup')})`}
                    </span>
                </div>
             </Card>

             <Button onClick={onDone} className="w-full h-16">
                 {t('results.save')}
             </Button>
             <div className="h-20" />
        </div>
    );
};

const HistoryScreen = ({ onNavigate }: { onNavigate: (page: string, params?: any) => void }) => {
    const t = useTranslation();
    const { user } = useAuth();
    const [trainings, setTrainings] = useState<TrainingSession[]>([]);
    const [loading, setLoading] = useState(true);

    React.useEffect(() => {
        const fetchHistory = async () => {
            setLoading(true);
            const uid = user?.uid || 'atleta_local_01';
            const data = await trainingService.getUserTrainings(uid);
            setTrainings(data);
            setLoading(false);
        };
        fetchHistory();
    }, [user]);

    const handleDelete = async (e: React.MouseEvent, id: string, date: string) => {
        e.preventDefault();
        e.stopPropagation();
        triggerFeedback('warning');
        
        // 1. Optimistic update (intervenção imediata no ecrã)
        // Removemos o confirm() pois o ambiente do AI Studio bloqueia janelas popup
        setTrainings(prev => prev.filter(t => {
            const isIdMatch = t.id && t.id === id;
            const isDateMatch = t.date === id || t.date === date;
            return !isIdMatch && !isDateMatch;
        }));
        
        try {
            // 2. Executa a eliminação real no storage
            await trainingService.deleteTraining(id, date);
            
            // 3. REFRESH: Pede os dados de novo para garantir sincronia total
            const uid = user?.uid || 'atleta_local_01';
            const freshData = await trainingService.getUserTrainings(uid);
            setTrainings(freshData);
            
            console.log("History refreshed after deletion");
        } catch (err) {
            console.error("Erro ao eliminar treino:", err);
            // Reverte para o estado da base de dados caso falhe
            const uid = user?.uid || 'atleta_local_01';
            const data = await trainingService.getUserTrainings(uid);
            setTrainings(data);
            alert(t('general.deleteError'));
        }
    };

    const [selectedForComparison, setSelectedForComparison] = useState<string[]>([]);
    const [isCompareMode, setIsCompareMode] = useState(false);

    const toggleSelection = (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        triggerFeedback('click');
        setSelectedForComparison(prev => 
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const startComparison = () => {
        onNavigate('compare', selectedForComparison);
    };

    const generatePDF = async () => {
        triggerFeedback('click');
        const doc = new jsPDF();
        const pageWidth = doc.internal.pageSize.getWidth();
        
        // Header
        doc.setFillColor(20, 20, 25);
        doc.rect(0, 0, pageWidth, 40, 'F');
        
        doc.setTextColor(236, 72, 153); // Pink/Accent
        doc.setFontSize(22);
        doc.setFont('helvetica', 'bold');
        doc.text('PRECISION SHOOTING', 14, 20);
        
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(10);
        doc.text('EPTS - ELITE PERFORMANCE TRAINING SYSTEM', 14, 28);
        
        doc.setTextColor(150, 150, 150);
        doc.setFontSize(8);
        doc.text(`${t('history.title')} - ${new Date().toLocaleDateString()}`, 14, 35);

        // Evolution Chart Section
        doc.setTextColor(0, 0, 0);
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('Evolução do Atirador', 14, 55);
        
        // Sort trainings by date for chart
        const sortedTrainings = [...trainings].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        
        if (sortedTrainings.length > 1) {
            const chartX = 14;
            const chartY = 65;
            const chartWidth = pageWidth - 28;
            const chartHeight = 60;
            
            // Draw chart background/axes
            doc.setDrawColor(200, 200, 200);
            doc.line(chartX, chartY + chartHeight, chartX + chartWidth, chartY + chartHeight); // X axis
            doc.line(chartX, chartY, chartX, chartY + chartHeight); // Y axis
            
            const scores = sortedTrainings.map(tr => tr.totalScore);
            const maxScore = Math.max(...scores, 10);
            const minScore = Math.min(...scores, 0);
            const range = maxScore - minScore || 1;
            
            doc.setDrawColor(236, 72, 153);
            doc.setLineWidth(0.8);
            
            sortedTrainings.forEach((tr, i) => {
                const x = chartX + (i / (sortedTrainings.length - 1)) * chartWidth;
                const y = chartY + chartHeight - ((tr.totalScore - minScore) / range) * chartHeight;
                
                if (i > 0) {
                    const prevX = chartX + ((i - 1) / (sortedTrainings.length - 1)) * chartWidth;
                    const prevY = chartY + chartHeight - ((sortedTrainings[i-1].totalScore - minScore) / range) * chartHeight;
                    doc.line(prevX, prevY, x, y);
                }
                
                // Draw point
                doc.setFillColor(236, 72, 153);
                doc.circle(x, y, 1.5, 'F');
                
                // Label score
                if (i === 0 || i === sortedTrainings.length - 1 || i % Math.ceil(sortedTrainings.length / 5) === 0) {
                    doc.setFontSize(6);
                    doc.setTextColor(100, 100, 100);
                    doc.text(tr.totalScore.toString(), x, y - 3, { align: 'center' });
                    doc.text(new Date(tr.date).toLocaleDateString([], { day: '2-digit', month: '2-digit' }), x, chartY + chartHeight + 10, { align: 'center' });
                }
            });
        } else {
            doc.setFontSize(10);
            doc.setTextColor(150, 150, 150);
            doc.text('Dados insuficientes para gerar gráfico de evolução.', 14, 70);
        }

        // Table
        const tableData = trainings.map(tr => [
            new Date(tr.date).toLocaleDateString(),
            tr.sessionType === 'competition' ? 'Prova' : 'Treino',
            tr.weaponType,
            tr.weaponModel || '-',
            tr.totalScore.toString(),
            tr.averageScore.toString(),
            tr.totalShots.toString()
        ]);

        autoTable(doc, {
            startY: 140,
            head: [['Data', 'Tipo', 'Arma', 'Modelo', 'Pontos', 'Média', 'Tiros']],
            body: tableData,
            headStyles: { fillColor: [20, 20, 25], textColor: [255, 255, 255], fontSize: 10, halign: 'center' },
            bodyStyles: { fontSize: 9, halign: 'center' },
            alternateRowStyles: { fillColor: [245, 245, 245] },
            margin: { top: 140 }
        });

        doc.save(`Historico_Precisao_${new Date().toISOString().split('T')[0]}.pdf`);
    };

    return (
        <div className="p-3 pb-40 bg-[var(--bg-primary)]">
            <Header 
                title={isCompareMode ? t('history.compare') : t('history.title')} 
                onBack={() => {
                    if (isCompareMode) {
                        setIsCompareMode(false);
                        setSelectedForComparison([]);
                    } else {
                        onNavigate('home');
                    }
                }} 
                rightElement={
                    <div className="flex gap-2">
                        {trainings.length > 0 && (
                            <button 
                                onClick={generatePDF}
                                className="px-2 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all border bg-pink-500/10 text-pink-500 border-pink-500/20 flex items-center gap-1"
                            >
                                <Download size={10} />
                                PDF
                            </button>
                        )}
                        {trainings.length > 0 && (
                            <button 
                                onClick={() => {
                                    triggerFeedback('click');
                                    setIsCompareMode(!isCompareMode);
                                    setSelectedForComparison([]);
                                }}
                                className={`px-2 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all border ${isCompareMode ? 'bg-[var(--accent)] text-white border-[var(--accent)]' : 'bg-zinc-500/10 text-[var(--text-secondary)] border-[var(--border-color)]'}`}
                            >
                                {isCompareMode ? t('history.exit') : t('history.compare')}
                            </button>
                        )}
                    </div>
                }
            />

            {loading ? (
                <div className="flex items-center justify-center p-12">
                    <div className="w-8 h-8 border-4 border-[var(--accent)] border-t-transparent rounded-full animate-spin"></div>
                </div>
            ) : trainings.length === 0 ? (
                <div className="text-center p-12 text-[var(--text-secondary)]">
                    <History size={64} className="mx-auto mb-4 opacity-20" />
                    <p>{t('history.noData')}</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {trainings.map((t_item, index) => (
                        <div 
                            key={t_item.id || t_item.date || index} 
                            className="relative group"
                        >
                            <div 
                                onClick={() => {
                                    triggerFeedback('click');
                                    if (isCompareMode) {
                                        toggleSelection({ stopPropagation: () => {} } as any, t_item.id || t_item.date);
                                    } else {
                                        onNavigate('training-detail', { id: t_item.id || t_item.date, openEdit: false });
                                    }
                                }}
                                className="cursor-pointer"
                            >
                                <Card className={`relative overflow-hidden transition-all ${!isCompareMode ? 'pr-24' : 'pr-4'} ${isCompareMode && selectedForComparison.includes(t_item.id || t_item.date) ? 'border-[var(--accent)] bg-[var(--accent)]/5' : 'hover:border-[var(--accent)]/30'}`}>
                                    {(() => {
                                        const ratio = t_item.targetPoints > 0 ? t_item.totalScore / t_item.targetPoints : 0;
                                        let statusColor = 'text-[var(--accent)]';
                                        let barColorClass = 'bg-[var(--accent)]';
                                        
                                        if (t_item.targetPoints > 0) {
                                            if (ratio >= 1) {
                                                statusColor = 'text-[var(--success)]';
                                                barColorClass = 'bg-[var(--success)]';
                                            } else if (ratio >= 0.75) {
                                                statusColor = 'text-yellow-500';
                                                barColorClass = 'bg-yellow-500';
                                            } else {
                                                statusColor = 'text-red-500';
                                                barColorClass = 'bg-red-500';
                                            }
                                        }

                                        return (
                                            <>
                                                <div className="flex justify-between items-start mb-2">
                                                    <div className="flex items-center gap-3">
                                                        {isCompareMode && (
                                                            <div 
                                                                className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${selectedForComparison.includes(t_item.id || t_item.date) ? 'border-[var(--accent)] bg-[var(--accent)]' : 'border-[var(--border-color)]'}`}
                                                            >
                                                                {selectedForComparison.includes(t_item.id || t_item.date) && <Check size={14} className="text-white" />}
                                                            </div>
                                                        )}
                                                        <div>
                                                            <div className="flex items-center gap-2 mb-1">
                                                                <Calendar size={12} className="text-[var(--text-secondary)]" />
                                                                <span className="text-[10px] text-[var(--text-secondary)] font-mono font-bold uppercase">{new Date(t_item.date).toLocaleDateString()}</span>
                                                                <div className={`px-1.5 py-0.5 rounded-full border text-[8px] font-black uppercase tracking-tighter ${t_item.sessionType === 'competition' ? 'bg-amber-500/10 border-amber-500/20 text-amber-500' : 'bg-blue-500/10 border-blue-500/20 text-blue-500'}`}>
                                                                    {t_item.sessionType === 'competition' ? t('training.competition') : t('training.training')}
                                                                </div>
                                                                {t_item.id && t_item.id.length > 10 && !t_item.id.includes('T') && (
                                                                    <div className="flex items-center gap-1 text-[var(--success)] opacity-60">
                                                                        <span className="text-[8px] uppercase font-bold">{t('history.cloud')}</span>
                                                                    </div>
                                                                )}
                                                            </div>
                                                            <h3 className="text-xl font-black leading-none uppercase text-[var(--text-primary)]">
                                                                {t_item.weaponType === 'Pistola' ? t('training.pistol') : (t_item.weaponType === 'Carabina' ? t('training.rifle') : t_item.weaponType)}
                                                                <div className="flex flex-col gap-0.5 mt-1.5">
                                                                    {t_item.competitionName && (
                                                                        <div className="flex items-center gap-1.5">
                                                                            <span className="text-[8px] px-1 py-0.5 bg-amber-500/10 text-amber-500 rounded font-black">{t('training.competition')}</span>
                                                                            <span className="text-[11px] text-amber-500 font-black">{t_item.competitionName}</span>
                                                                        </div>
                                                                    )}
                                                                    {t_item.weaponModel && (
                                                                        <div className="flex items-center gap-1.5">
                                                                            <span className="text-[8px] px-1 py-0.5 bg-[var(--accent)]/10 text-[var(--accent)] rounded font-black">{t('training.weapon')}</span>
                                                                            <span className="text-[11px] text-[var(--accent)] font-bold">{t_item.weaponModel}</span>
                                                                        </div>
                                                                    )}
                                                                    {t_item.ammoBrand && (
                                                                        <div className="flex items-center gap-1.5">
                                                                            <span className="text-[8px] px-1 py-0.5 bg-zinc-500/10 text-zinc-500 rounded font-black">{t('training.ammoBrand')}</span>
                                                                            <span className="text-[11px] text-zinc-500 font-bold">{t_item.ammoBrand}</span>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </h3>
                                                        </div>
                                                    </div>
                                                    <div className="text-right flex flex-col items-end">
                                                        <span className={`text-3xl font-mono font-black ${statusColor} leading-tight`}>{t_item.totalScore}</span>
                                                        <span className={`text-xs font-bold uppercase ${statusColor} opacity-80 leading-none mb-1`}>{t('general.pts')}</span>
                                                        {t_item.targetPoints > 0 && (
                                                            <div className="mt-1 flex flex-col items-end">
                                                                <span className="text-[8px] text-zinc-500 uppercase font-bold">{t('training.scoreGoal')}</span>
                                                                <span className="text-[10px] font-mono font-bold text-zinc-400">{t_item.targetPoints}</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-4 text-xs text-[var(--text-secondary)]">
                                                    <div className="flex items-center gap-1">
                                                        <Target size={12} />
                                                        <span>{t_item.averageScore}/10 {t('general.avg')}</span>
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                        <Waves size={12} />
                                                        <span>
                                                            {t_item.numSeries || t_item.series.filter(s => !s.isWarmup).length} {t('results.series')} ({t_item.totalShots} {t('training.shots')})
                                                        </span>
                                                    </div>
                                                </div>
                                                {t_item.targetPoints > 0 && (
                                                    <div className="mt-3 h-1.5 w-full bg-zinc-500/10 rounded-full overflow-hidden">
                                                        <div 
                                                            className={`h-full transition-all ${barColorClass}`}
                                                            style={{ width: `${Math.min(100, ratio * 100)}%` }}
                                                        />
                                                    </div>
                                                )}
                                            </>
                                        );
                                    })()}

                                </Card>
                            </div>

                            {!isCompareMode && (
                                <div className="absolute right-0 top-0 bottom-0 flex items-center pr-2 gap-0.5 z-20">
                                    <button 
                                        type="button"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            triggerFeedback('click');
                                            onNavigate('training-detail', { id: t_item.id || t_item.date, openEdit: true });
                                        }}
                                        className="w-10 h-10 rounded-xl flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--accent)] hover:bg-[var(--accent)]/10 active:scale-95 transition-all"
                                        title={t('general.edit') || 'Editar'}
                                    >
                                        <Edit2 size={16} />
                                    </button>
                                    <button 
                                        type="button"
                                        onClick={(e) => handleDelete(e, t_item.id || t_item.date, t_item.date)}
                                        className="w-10 h-10 rounded-xl flex items-center justify-center text-[var(--text-secondary)] hover:text-red-500 hover:bg-red-500/10 active:scale-95 transition-all"
                                        title={t('general.delete')}
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {isCompareMode && selectedForComparison.length >= 2 && (
                <div className="fixed bottom-24 left-1/2 -translate-x-1/2 w-full max-w-md px-6 z-50">
                    <motion.button 
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        onClick={startComparison}
                        className="w-full bg-[var(--accent)] text-white font-black py-4 rounded-2xl shadow-2xl flex items-center justify-center gap-2 uppercase tracking-widest text-sm"
                    >
                        <Zap size={20} />
                        {t('history.compare')} {selectedForComparison.length} {t('home.latestTrainings')}
                    </motion.button>
                </div>
            )}
            <AdBanner />
            <div className="h-20" />
        </div>
    );
};

const CompareScreen = ({ selectedIds, onNavigate }: { selectedIds: string[]; onNavigate: (page: string, params?: any) => void }) => {
    const t = useTranslation();
    const { user } = useAuth();
    const [trainings, setTrainings] = useState<TrainingSession[]>([]);
    const [loading, setLoading] = useState(true);

    React.useEffect(() => {
        const fetchTrainings = async () => {
            setLoading(true);
            const uid = user?.uid || 'atleta_local_01';
            const all = await trainingService.getUserTrainings(uid);
            setTrainings(all.filter(t => t.id && selectedIds.includes(t.id)));
            setLoading(false);
        };
        fetchTrainings();
    }, [user, selectedIds]);

    if (loading) return (
        <div className="flex items-center justify-center p-20">
            <div className="w-8 h-8 border-4 border-[var(--accent)] border-t-transparent rounded-full animate-spin"></div>
        </div>
    );

    return (
        <div className="p-3 pb-40 bg-[var(--bg-primary)]">
            <Header title={t('compare.title')} onBack={() => onNavigate('history')} />

            <div className="flex gap-3 overflow-x-auto pb-4 -mx-3 px-3 sticky top-0 bg-[var(--bg-primary)] z-10 scrollbar-hide">
                {trainings.map((t_sess, idx) => (
                    <div key={t_sess.id || idx} className="min-w-[260px] shrink-0">
                        <Card className="h-full border-[var(--accent)] shadow-xl">
                            <div className="flex justify-between items-start mb-3">
                                <div>
                                    <div className="text-[9px] text-[var(--text-secondary)] font-mono font-bold uppercase mb-1">{new Date(t_sess.date).toLocaleDateString()}</div>
                                    <h3 className="text-lg font-black uppercase text-[var(--text-primary)]">{t_sess.weaponType}</h3>
                                </div>
                                <div className="bg-[var(--accent)]/10 text-[var(--accent)] px-2 py-1 rounded-lg text-[9px] font-black uppercase">#{idx + 1}</div>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <span className="text-[10px] uppercase tracking-widest text-[var(--text-secondary)] font-bold block mb-1">{t('results.totalPoints')}</span>
                                    <div className="text-3xl font-mono font-black text-[var(--accent)]">{t_sess.totalScore} <span className="text-xs text-[var(--text-secondary)] ml-1">{t('general.pts')}</span></div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <span className="text-[10px] uppercase tracking-widest text-[var(--text-secondary)] font-bold block mb-1">{t('home.sessionAvg')}</span>
                                        <div className="text-xl font-mono font-black text-[var(--text-primary)]">{t_sess.averageScore}</div>
                                    </div>
                                    <div>
                                        <span className="text-[10px] uppercase tracking-widest text-[var(--text-secondary)] font-bold block mb-1">{t('training.shots')}</span>
                                        <div className="text-xl font-mono font-black text-[var(--text-primary)]">{t_sess.officialShots}</div>
                                    </div>
                                </div>

                                <div className="h-2 w-full bg-zinc-800 rounded-full overflow-hidden">
                                    <div 
                                        className="h-full bg-[var(--accent)]"
                                        style={{ width: `${Math.min(100, (t_sess.totalScore / (t_sess.targetPoints || 250)) * 100)}%` }}
                                    />
                                </div>

                                <div className="pt-4 border-t border-[var(--border-color)]">
                                    <span className="text-[10px] uppercase tracking-widest text-[var(--text-secondary)] font-bold block mb-2">{t('compare.performanceBySeries')}</span>
                                    <div className="space-y-2">
                                        {t_sess.series.filter(s => !s.isWarmup).map((s, si) => (
                                            <div key={si} className="flex items-center justify-between text-xs">
                                                <span className="text-zinc-500 font-bold uppercase">{t('compare.series')} {si + 1}</span>
                                                <span className="font-mono font-black text-[var(--accent)]">{s.shots.reduce((a, b) => a + b, 0)} {t('general.pts')}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </Card>
                    </div>
                ))}
            </div>

            <Card className="mt-6">
                <h4 className="text-xs uppercase tracking-widest text-zinc-500 font-bold mb-4 flex items-center gap-2">
                    <TrendingUp size={14} /> {t('compare.analysis')}
                </h4>
                <div className="space-y-6">
                    <div>
                        <div className="flex justify-between items-end mb-2">
                            <span className="text-xs text-zinc-400">{t('compare.title')}</span>
                            <span className="text-[10px] font-mono text-[var(--accent)]">Diff: {Math.max(...trainings.map(sess => sess.totalScore)) - Math.min(...trainings.map(sess => sess.totalScore))} {t('general.pts')}</span>
                        </div>
                        <div className="relative h-12 flex items-center gap-2">
                             {trainings.map((t_bar, idx_bar) => (
                                 <motion.div 
                                    key={idx_bar}
                                    initial={{ height: 0 }}
                                    animate={{ height: `${(t_bar.totalScore / Math.max(...trainings.map(x => x.totalScore))) * 100}%` }}
                                    className="flex-1 bg-[var(--accent)]/20 rounded-t-lg relative group"
                                 >
                                     <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] font-mono font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                                         {t_bar.totalScore}
                                     </div>
                                 </motion.div>
                             ))}
                        </div>
                    </div>
                </div>
            </Card>
            <div className="h-20" />
        </div>
    );
};

const SettingsScreen = ({ onNavigate }: { onNavigate: (page: string, params?: any) => void }) => {
    const { logOut } = useAuth();
    const { theme, setTheme, soundEnabled, setSoundEnabled, language, setLanguage } = useTheme();
    const t = useTranslation();

    return (
        <div className="p-3 pb-40">
            <Header title={t('settings.title')} onBack={() => onNavigate('home')} />

            <section className="mb-8 mt-2">
                <div className="flex items-center gap-2 mb-3 px-2">
                    <label className="text-xs uppercase tracking-widest text-zinc-500 font-bold block">{t('settings.supportTitle')}</label>
                    <motion.div
                        animate={{ rotate: [0, 10, -10, 10, 0] }}
                        transition={{ repeat: Infinity, duration: 5, ease: "easeInOut" }}
                    >
                        <Coffee size={14} className="text-[#00FFC2] drop-shadow-[0_0_5px_#00FFC2]" />
                    </motion.div>
                </div>
                <Card className="space-y-6 border-yellow-400/20 bg-yellow-400/5">
                    <p className="text-sm text-yellow-400 leading-relaxed font-medium italic px-1 text-center">
                        "{t('settings.supportText')}"
                    </p>
                    
                    <div className="flex justify-center gap-10 py-2">
                        <div className="flex flex-col items-center gap-2">
                            <button 
                                onClick={() => window.open('https://revolut.me/n_nascimento', '_blank')}
                                className="w-14 h-14 bg-zinc-900/50 rounded-2xl flex items-center justify-center transition-all shadow-[0_4px_0_#000] active:shadow-none active:translate-y-[4px] border border-zinc-800 group"
                                title="Revolut"
                            >
                                <img 
                                    src="https://cdn.simpleicons.org/revolut/00FFC2" 
                                    alt="Revolut" 
                                    className="w-6 h-6 object-contain drop-shadow-[0_0_8px_rgba(0,255,194,0.3)]"
                                    referrerPolicy="no-referrer"
                                />
                            </button>
                            <span className="text-[10px] uppercase font-black text-zinc-500 tracking-tighter">Revolut</span>
                        </div>

                        <div className="flex flex-col items-center gap-2">
                            <button 
                                onClick={() => window.open('https://paypal.me/dnklsh', '_blank')}
                                className="w-14 h-14 bg-zinc-900/50 rounded-2xl flex items-center justify-center transition-all shadow-[0_4px_0_#000] active:shadow-none active:translate-y-[4px] border border-zinc-800 group"
                                title="PayPal"
                            >
                                <img 
                                    src="https://cdn.simpleicons.org/paypal/00FFC2" 
                                    alt="PayPal" 
                                    className="w-6 h-6 object-contain drop-shadow-[0_0_8px_rgba(0,255,194,0.3)]"
                                    referrerPolicy="no-referrer"
                                />
                            </button>
                            <span className="text-[10px] uppercase font-black text-zinc-500 tracking-tighter">PayPal</span>
                        </div>
                    </div>
                </Card>
            </section>
            
            <section className="mb-6">
                <label className="text-xs uppercase tracking-widest text-zinc-500 font-bold mb-2 block px-2">{t('settings.appearance')}</label>
                <Card className="space-y-4">
                    <div className="flex flex-col gap-2">
                        <span className="text-sm text-[var(--text-secondary)]">{t('settings.theme')}</span>
                        <div className="grid grid-cols-2 gap-2">
                            {(['dark', 'light'] as const).map(t_theme => (
                                <button 
                                    key={t_theme}
                                    onClick={() => {
                                        setTheme(t_theme);
                                        triggerFeedback('click');
                                    }}
                                    className={`py-6 px-1 rounded-xl border text-xs font-black uppercase transition-all flex flex-col items-center justify-center gap-2 ${theme === t_theme ? 'border-[var(--accent)] bg-[var(--accent)]/10 text-[var(--accent)]' : 'border-[var(--border-color)] bg-zinc-500/5 text-[var(--text-secondary)]'}`}
                                >
                                    <div className={`w-4 h-4 rounded-full shadow-inner`} style={{ backgroundColor: t_theme === 'dark' ? '#00ffd0' : '#007aff' }}></div>
                                    {t_theme === 'dark' ? t('settings.themeDark') : t('settings.themeLight')}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="flex flex-col gap-2 pt-2 border-t border-white/5">
                        <span className="text-sm text-[var(--text-secondary)]">{t('settings.language')}</span>
                        <div className="grid grid-cols-2 gap-2">
                            {(['pt', 'en'] as const).map(lang => (
                                <button 
                                    key={lang}
                                    onClick={() => {
                                        setLanguage(lang);
                                        triggerFeedback('click');
                                    }}
                                    className={`py-4 px-1 rounded-xl border text-xs font-black uppercase transition-all flex flex-col items-center justify-center gap-2 ${language === lang ? 'border-[var(--accent)] bg-[var(--accent)]/10 text-[var(--accent)]' : 'border-[var(--border-color)] bg-zinc-500/5 text-[var(--text-secondary)]'}`}
                                >
                                    <span className="text-2xl">{lang === 'pt' ? '🇵🇹' : '🇬🇧'}</span>
                                    <span>{lang === 'pt' ? t('settings.langPt') : t('settings.langEn')}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                </Card>
            </section>

            <section className="mb-8">
                <label className="text-xs uppercase tracking-widest text-zinc-500 font-bold mb-3 block px-2">{t('settings.preferences')}</label>
                <Card className="space-y-4">
                    <div className="flex items-center justify-between py-2 border-b border-white/5">
                        <span className="text-zinc-300 uppercase text-[10px] font-bold tracking-widest font-mono">{t('settings.sound')}</span>
                        <button 
                            onClick={() => {
                                setSoundEnabled(!soundEnabled);
                                triggerFeedback('click');
                            }}
                            className={`w-12 h-6 rounded-full transition-colors relative ${soundEnabled ? 'bg-[var(--accent)]' : 'bg-zinc-800'}`}
                        >
                             <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${soundEnabled ? 'right-1' : 'left-1'}`}></div>
                        </button>
                    </div>
                </Card>
            </section>

            <section className="mb-8">
                <label className="text-xs uppercase tracking-widest text-zinc-500 font-bold mb-3 block px-2">{t('settings.info')}</label>
                <Card className="space-y-4">
                    <div className="flex items-center justify-between py-2 border-b border-white/5">
                        <span className="text-zinc-300">{t('settings.version')}</span>
                        <span className="text-zinc-500 font-mono text-xs">1.0.0</span>
                    </div>
                </Card>
            </section>



            <AdBanner />

            <div className="text-center opacity-20 py-8">
                <Target size={48} className="mx-auto mb-2" />
                <p className="text-[10px] uppercase tracking-widest font-bold">TdPR® v1.0</p>
                <p className="text-[8px] uppercase tracking-widest mt-1">por: Nuno Nascimento</p>
            </div>
            <div className="h-20" />
        </div>
    );
};

// --- Main App Wrapper ---

const AppContent = () => {
  const { user, loading } = useAuth();
  const [currentPage, setCurrentPage] = useState('home');
  const [navigationParams, setNavigationParams] = useState<any>(null);
  const [activeConfig, setActiveConfig] = useState<any>(null);
  const [activeResults, setActiveResults] = useState<any>(null);
  const [viewingTrainingId, setViewingTrainingId] = useState<string | null>(null);
  const [selectedComparisonIds, setSelectedComparisonIds] = useState<string[]>([]);
  const [hasEntered, setHasEntered] = useState(() => localStorage.getItem('has_entered_precision') === 'true');
  const [globalTarget, setGlobalTarget] = useState(() => parseInt(localStorage.getItem('precision_global_target') || '250'));
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const t = useTranslation();

  const updateGlobalTarget = (val: number) => {
    setGlobalTarget(val);
    localStorage.setItem('precision_global_target', val.toString());
  };

  if (loading) return (
    <div className="flex items-center justify-center py-20 bg-[var(--bg-primary)]">
      <div className="w-10 h-10 border-4 border-[var(--accent)] border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  if (!hasEntered) return <LoginScreen onEnter={() => setHasEntered(true)} />;

  const navigateTo = (page: string, params?: any) => {
    triggerFeedback('click');
    setNavigationParams(params);
    if (page === 'training-detail') {
      const resolvedId = typeof params === 'object' && params !== null && 'id' in params ? params.id : params;
      setViewingTrainingId(resolvedId);
    }
    if (page === 'compare') setSelectedComparisonIds(params);
    setCurrentPage(page);
  };

  const startTraining = (config: any) => {
    setActiveResults(null);
    setActiveConfig(config);
    setCurrentPage('active-training');
  };

  const cancelTraining = () => {
    setActiveConfig(null);
    setCurrentPage('home');
  };

  const finishTraining = async (results: any) => {
    const uid = user?.uid || 'atleta_local_01';
    const trainingData = { ...results, userId: uid };
    setActiveResults(trainingData);
    setCurrentPage('results');
    
    // Save in background
    trainingService.saveTraining(trainingData).catch(e => {
        console.error("Could not save training to cloud:", e);
    });
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'home': return <HomeScreen onNavigate={navigateTo} />;
      case 'new-training': return <NewTrainingScreen onNavigate={navigateTo} onStart={startTraining} defaultTarget={globalTarget} initialType={navigationParams?.type} />;
      case 'active-training': return <ActiveTrainingScreen config={activeConfig} onFinish={finishTraining} onCancel={cancelTraining} />;
      case 'results': return <ResultsScreen results={activeResults} onDone={() => navigateTo('home')} />;
      case 'history': return <HistoryScreen onNavigate={navigateTo} />;
      case 'settings': return <SettingsScreen onNavigate={navigateTo} />;
      case 'info': return <InfoScreen onNavigate={navigateTo} />;
      case 'training-detail': {
        const isDirectEdit = Boolean(typeof navigationParams === 'object' && navigationParams?.openEdit);
        return <TrainingDetailScreen trainingId={viewingTrainingId!} initialEdit={isDirectEdit} onNavigate={navigateTo} />;
      }
      case 'compare': return <CompareScreen selectedIds={selectedComparisonIds} onNavigate={navigateTo} />;
      default: return <HomeScreen onNavigate={navigateTo} />;
    }
  };

  return (
    <div 
      id="scroll-container" 
      className="max-w-md mx-auto min-h-full safe-top safe-bottom border-x border-zinc-500/10 shadow-2xl relative"
      style={{ touchAction: 'auto' }}
    >
      <div className="flex flex-col">
        <AnimatePresence mode="wait">
          <motion.div
             key={currentPage}
             initial={{ opacity: 0, x: 10 }}
             animate={{ opacity: 1, x: 0 }}
             exit={{ opacity: 0, x: -10 }}
             transition={{ duration: 0.2 }}
             className="flex flex-col flex-1"
          >
            {renderPage()}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Bottom Nav - FIXED at the bottom of the container */}
      {['home', 'history', 'info', 'settings'].includes(currentPage) && (
          <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md px-6 pb-6 pt-2 z-[1000]">
              <div className="flex justify-between items-center bg-[var(--bg-secondary)] border border-[var(--border-color)] p-2 rounded-2xl shadow-2xl">
                    <button onClick={() => { triggerFeedback('click'); navigateTo('home'); }} className={`flex-1 flex flex-col items-center justify-center p-2 rounded-xl transition-colors ${currentPage === 'home' ? 'bg-[var(--accent)] text-black' : 'text-[var(--text-secondary)]'}`}>
                        <Target size={20} />
                        <span className="text-[9px] font-bold uppercase mt-1">{t('nav.home')}</span>
                    </button>
                    <button onClick={() => { triggerFeedback('click'); navigateTo('history'); }} className={`flex-1 flex flex-col items-center justify-center p-2 rounded-xl transition-colors ${currentPage === 'history' ? 'bg-[var(--accent)] text-black' : 'text-[var(--text-secondary)]'}`}>
                        <History size={20} />
                        <span className="text-[9px] font-bold uppercase mt-1">{t('nav.history')}</span>
                    </button>
                    <button onClick={() => { triggerFeedback('click'); navigateTo('info'); }} className={`flex-1 flex flex-col items-center justify-center p-2 rounded-xl transition-colors ${currentPage === 'info' ? 'bg-[var(--accent)] text-black' : 'text-[var(--text-secondary)]'}`}>
                        <Info size={20} />
                        <span className="text-[9px] font-bold uppercase mt-1">{t('nav.info')}</span>
                    </button>
                    <button onClick={() => { triggerFeedback('click'); navigateTo('settings'); }} className={`flex-1 flex flex-col items-center justify-center p-2 rounded-xl transition-colors ${currentPage === 'settings' ? 'bg-[var(--accent)] text-black' : 'text-[var(--text-secondary)]'}`}>
                        <Settings size={20} />
                        <span className="text-[9px] font-bold uppercase mt-1">{t('nav.settings')}</span>
                    </button>
              </div>
          </div>
      )}
    </div>
  );
};

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  );
}
