/*
Module Name: KPIs
Version: 1.0.0
Author: Julian Loaiza
Website: Idoc */

var kpiName = {
    LTE:[{'CELLAVAILABILITYRATE':'Cell Availability Rate'},
    {'MIMO2BRANCHUTILIZATION':'Usage MIMO (%)'},
    {'AVERAGERSSIFORPUSCH':'Average RSSI for PUSCH'},
    {'AVERAGESINRFORPUSCH':'Average SINR for PUSCH'},
    {'UEPOWERHEADROOM':'UE Power Headroom'},
    {'AVERAGECQI':'Average CQI'},
    {'UEREPORTEDCQIPOOR':'UE Reported CQI Poor'},
    {'AVGPDCPDLCELLTHROUGHPUT':'Average Cell DL Throughput (kbps)'},
    {'DLMAXCELLTHROUGHPUTKBPS':'DL Max Cell Throughput (kbps)'},
    {'CELL_LOAD_ACT_UE_AVG':'Ave Act UE'},
    {'CELL_LOAD_ACT_UE_MAX':'Max Act UE'},
    {'DLPRBUTILIZATION':'% DL PRB Utilization'},
    {'AVERAGEDLLATENCY':'Average DL Latency'},
    {'CCEBLOCKING':'CCE Blocking'},
    {'DL_TRAFFIC_VOLUME_MB':'DL Traffic Volume (MB)'},
    {'UL_TRAFFIC_VOLUME_MB':'UL Traffic Volume (MB)'},
    {'VOLTECALLS':'VoLTE Calls'},
    {'VOLTEERLANGS':'VoLTE Traffic (Erl)'},
    {'VOLTEACCESSFAILURES':'VoLTE Access Failures'},
    {'VOLTEDROPRATEGCRL16':'Volte Drop Rate'},
    {'TOTALVOLTEDROPSL16':'Total VoLTE Drops'},
    {'VOLTECALLSGOINGTO3GOR2GL15':'% VoLTE  calls going to 3G/2G'},
    {'UE_DIST_AVG':'Avg UE dist (kms)'}
    ],
    UMTS:[{'diagnostic':'Possible Issue Detected'},
        {'voice_traffic':'Voice Traffic (Erl)'},
        {'voice_acc_fail_rate':'Voice Access Fail Rate (%)'}, 
        {'voice_drop_rate':'Voice Drop Rate (%)'},
        {'voice_drops': 'Voice Drops (#)'},
        {'dlr99datatraffic': 'DL R99 Data Traffic (MB)'},
        {'hsdpatrafficvolume': 'HSDPA Traffic (MB)'},
        {'ps_acc_fail_rate': 'PS Access Fail Rate (%)'},
        {'ps_drop_rate': 'PS Drop Rate (%)'},
        {'soft_handover_failure_rate': 'Soft HO Fail Rate (%)'},
        {'voice_traffic_sev': 'High Voice Traffic (#)'},
        {'voice_drops_raw_sev': 'Voice Drops Severity (#)'}
    ],
     GSM:{}
};     