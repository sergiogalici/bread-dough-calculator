;<Modal
  title="Risultati"
  open={modalVisible}
  onOk={handleModalOk}
  onCancel={handleModalCancel}
  style={{ gap: 20 }}
  okText="Nuovo calcolo"
  cancelText="Torna al calcolo"
>
  {results && (
    <div className="results-box">
      <Alert
        message={`Totale Polveri: ${results.totalFlourAmount} g`}
        type="info"
        showIcon
      />
      <Alert message={`W: ${results.wRating}`} type="info" showIcon />

      <Alert message={`Acqua: ${results.totalWater} g`} type="info" showIcon />
      <Alert message={`Sale: ${results.totalSalt} g`} type="info" showIcon />
      <Alert
        message={`Lievito Madre: ${results.totalYeast} g`}
        type="info"
        showIcon
      />
      <Alert
        message={`Tempo di Lievitazione: ${results.riseTime}`}
        type="info"
        showIcon
      />
    </div>
  )}
</Modal>
