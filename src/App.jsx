import React, { useEffect, useState } from "react"
import {
  Layout,
  Form,
  InputNumber,
  Select,
  Button,
  Typography,
  Space,
  Modal,
  Alert,
} from "antd"
import { PlusOutlined, DeleteOutlined } from "@ant-design/icons"
import "./App.css"

const { Header, Content, Footer } = Layout
const { Title } = Typography
const { Option } = Select

const App = () => {
  const [results, setResults] = useState(null)
  const [form] = Form.useForm()
  const [modalVisible, setModalVisible] = useState(false)

  useEffect(() => {
    console.log("Modal is visible:", modalVisible)
  }, [setModalVisible])

  const calculateDough = (values) => {
    const { flours, temperature } = values
    let totalWater = 0
    let totalSalt = 0
    let totalYeast = 0
    let totalFiber = 0
    let totalFat = 0
    let totalProtein = 0
    let totalDurumWheat = 0
    let totalSoftWheat = 0

    flours.forEach((flour) => {
      const {
        flourAmount,
        proteinContent,
        fiberContent,
        fatContent,
        flourKind,
      } = flour

      console.log("type = ", flourKind)
      totalProtein += flourAmount * (proteinContent / 100)
      totalFiber += flourAmount * (fiberContent / 100)
      totalFat += flourAmount * (fatContent / 100)
      totalSalt += flourAmount * 0.02 // Assumo 2% di sale in base alla quantità di farina

      if (flourKind === "grano duro") {
        totalDurumWheat += flourAmount
      } else {
        totalSoftWheat += flourAmount
      }
    })

    console.log("Total protein:", totalProtein)
    console.log("Total fiber:", totalFiber)
    console.log("Total fat:", totalFat)
    console.log("Total durum wheat:", totalDurumWheat)
    console.log("Total soft wheat:", totalSoftWheat)

    totalFat = totalFat ?? 0

    const totalFlourAmount = totalDurumWheat + totalSoftWheat

    // Calcolo della quantità di lievito in base alla temperatura
    if (temperature < 10) {
      totalYeast = totalFlourAmount * 0.2
    } else if (temperature >= 10 && temperature < 20) {
      totalYeast = totalFlourAmount * (0.2 - (temperature - 10) * 0.01)
    } else if (temperature >= 20 && temperature < 30) {
      totalYeast = totalFlourAmount * (0.1 + (30 - temperature) * 0.01)
    } else {
      totalYeast = totalFlourAmount * 0.1
    }

    // Assicurati che la quantità di lievito sia tra il 10% e il 20% della quantità di farina
    totalYeast = Math.max(
      totalFlourAmount * 0.1,
      Math.min(totalYeast, totalFlourAmount * 0.2)
    )

    // Calcolo del tempo di lievitazione in base alla temperatura
    let firstProofingTime
    let secondProofingTime

    if (temperature < 10) {
      firstProofingTime = "12-18 ore"
      secondProofingTime = "6-12 ore"
    } else if (temperature < 15) {
      firstProofingTime = "8-12 ore"
      secondProofingTime = "4-8 ore"
    } else if (temperature < 20) {
      firstProofingTime = "6-8 ore"
      secondProofingTime = "3-6 ore"
    } else if (temperature < 25) {
      firstProofingTime = "4-6 ore"
      secondProofingTime = "2-4 ore"
    } else if (temperature < 30) {
      firstProofingTime = "2-4 ore"
      secondProofingTime = "1-2 ore"
    } else {
      firstProofingTime = "1-2 ore"
      secondProofingTime = "1 ora"
    }

    const riseTime = `${firstProofingTime} (prima lievitazione), ${secondProofingTime} (seconda lievitazione)`

    // Calcolo dei macronutrienti e indice glicemico
    const fiberRatio = (totalFiber / totalFlourAmount) * 100
    const fatRatio = (totalFat / totalFlourAmount) * 100

    let glycemicIndex
    if (fiberRatio > 10) {
      glycemicIndex = "Basso"
    } else if (fiberRatio > 5) {
      glycemicIndex = "Medio"
    } else {
      glycemicIndex = "Alto"
    }

    const proteinRatio =
      (totalProtein / (totalFlourAmount - totalProtein - totalFat)) * 100

    let wRating = ""
    let waterRangeMin, waterRangeMax
    let waterRatio = 1 + totalFiber * 0.001

    // Se totalFlourAmount è maggiore di zero, calcola la percentuale di grano duro e grano tenero
    const durumWheatPercentage = (totalDurumWheat / totalFlourAmount) * 100

    console.log("Durum wheat percentage:", durumWheatPercentage)

    // Definisci gli scaglioni in base alla percentuale di grano duro o grano tenero
    if (durumWheatPercentage >= 50) {
      // Più del 50% di grano duro
      waterRatio *= 0.9 // Riduci il water ratio in modo graduale
    } else if (durumWheatPercentage >= 30) {
      // Tra il 30% e il 50% di grano duro
      const factor =
        0.9 + ((durumWheatPercentage - 30) * (0.93 - 0.9)) / (50 - 30)
      waterRatio *= factor // Adatta il water ratio in modo più graduale
    } else if (durumWheatPercentage >= 20) {
      // Tra il 20% e il 30% di grano duro
      const factor =
        0.93 + ((durumWheatPercentage - 20) * (0.95 - 0.93)) / (30 - 20)
      waterRatio *= factor // Adatta il water ratio in modo più graduale
    } else {
      // Meno del 20% di grano duro
      const factor = 0.95 + ((durumWheatPercentage - 0) * (1 - 0.95)) / (20 - 0)
      waterRatio *= factor // Adatta il water ratio in modo più graduale
    }

    console.log("Water ratio:", waterRatio)
    console.log("Protein ratio:", proteinRatio)

    if (proteinRatio < 10) {
      waterRangeMin = totalFlourAmount * 0.55 * waterRatio
      waterRangeMax = totalFlourAmount * 0.6 * waterRatio
      wRating = "90 - 220"
    } else if (proteinRatio >= 10 && proteinRatio < 11) {
      waterRangeMin = totalFlourAmount * 0.6 * waterRatio
      waterRangeMax = totalFlourAmount * 0.7 * waterRatio
      wRating = "160 - 240"
    } else if (proteinRatio >= 11 && proteinRatio < 12) {
      waterRangeMin = totalFlourAmount * 0.6 * waterRatio
      waterRangeMax = totalFlourAmount * 0.75 * waterRatio
      wRating = "220 - 260"
    } else if (proteinRatio >= 12 && proteinRatio < 13) {
      waterRangeMin = totalFlourAmount * 0.6 * waterRatio
      waterRangeMax = totalFlourAmount * 0.8 * waterRatio
      wRating = "240 - 290"
    } else if (proteinRatio >= 13 && proteinRatio < 14) {
      waterRangeMin = totalFlourAmount * 0.65 * waterRatio
      waterRangeMax = totalFlourAmount * 0.8 * waterRatio
      wRating = "270 - 340"
    } else if (proteinRatio >= 14 && proteinRatio < 15) {
      waterRangeMin = totalFlourAmount * 0.7 * waterRatio
      waterRangeMax = totalFlourAmount * 1 * waterRatio
      wRating = "320 - 430"
    } else if (proteinRatio >= 15 && proteinRatio < 16) {
      waterRangeMin = totalFlourAmount * 0.8 * waterRatio
      waterRangeMax = Math.min(totalFlourAmount * 1, totalFlourAmount)
      wRating = "360 - 400++"
    } else if (proteinRatio >= 16) {
      waterRangeMin = totalFlourAmount * 0.8 * waterRatio
      waterRangeMax = Math.min(totalFlourAmount * 1, totalFlourAmount)
      wRating = "400++"
    }

    setResults({
      totalFlourAmount: totalFlourAmount.toFixed(0),
      totalWater: `${waterRangeMin.toFixed(0)} - ${waterRangeMax.toFixed(0)}`,
      totalSalt: totalSalt.toFixed(0),
      totalYeast: totalYeast.toFixed(0),
      riseTime,
      proteinRatio: proteinRatio.toFixed(1),
      fiberRatio: fiberRatio.toFixed(1),
      fatRatio: fatRatio.toFixed(1),
      glycemicIndex,
      wRating,
    })

    setModalVisible(true)
  }

  const handleModalOk = () => {
    setModalVisible(false)
    setResults(null)
    form.resetFields()
  }

  const handleModalCancel = () => {
    setModalVisible(false)
  }

  return (
    <Layout>
      <Header
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: 120,
        }}
      >
        <Title style={{ color: "white", textAlign: "center" }}>
          Calcolatore per Impasti
        </Title>
      </Header>
      <Content
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "flex-start",
          flexDirection: "column",
          width: "100%",
        }}
      >
        <div className="container">
          <div className="form-box">
            <Form
              layout="vertical"
              form={form}
              onFinish={calculateDough}
              initialValues={{
                flours: [
                  {
                    flourKind: undefined,
                    flourAmount: 0,
                    proteinContent: 0,
                    fiberContent: 0,
                    fatContent: 0,
                  },
                ],
              }}
            >
              <Form.List name="flours">
                {(fields, { add, remove }) => (
                  <>
                    {fields.map((field, index) => (
                      <div key={field.key} className="flour-box">
                        <Space
                          align="baseline"
                          style={{ display: "flex", marginBottom: 8 }}
                        >
                          <Form.Item
                            {...field}
                            name={[field.name, "flourKind"]}
                            fieldKey={[field.fieldKey, "flourKind"]}
                            label="Tipo di Grano"
                            rules={[
                              {
                                required: true,
                                message: "Seleziona il tipo di grano!",
                              },
                            ]}
                          >
                            <Select
                              style={{ width: 200 }}
                              placeholder="Seleziona il tipo di grano"
                            >
                              <Option value="grano duro">Grano Duro</Option>
                              <Option value="grano tenero">Grano Tenero</Option>
                            </Select>
                          </Form.Item>

                          <Form.Item
                            {...field}
                            name={[field.name, "proteinContent"]}
                            fieldKey={[field.fieldKey, "proteinContent"]}
                            label="Contenuto di Proteine (%)"
                            style={{ width: 200 }}
                            rules={[
                              {
                                required: true,
                                message: "Inserisci il contenuto di proteine!",
                              },
                            ]}
                          >
                            <InputNumber
                              min={0}
                              max={100}
                              placeholder="Inserisci il contenuto di proteine"
                              style={{ width: "100%" }}
                            />
                          </Form.Item>

                          <Form.Item
                            {...field}
                            name={[field.name, "fiberContent"]}
                            fieldKey={[field.fieldKey, "fiberContent"]}
                            label="Contenuto di Fibre (%)"
                            style={{ width: 200 }}
                            rules={[
                              {
                                required: true,
                                message: "Inserisci il contenuto di fibre!",
                              },
                            ]}
                          >
                            <InputNumber
                              min={0}
                              max={100}
                              placeholder="Inserisci il contenuto di fibre"
                              style={{ width: "100%" }}
                            />
                          </Form.Item>

                          <Form.Item
                            {...field}
                            name={[field.name, "fatContent"]}
                            fieldKey={[field.fieldKey, "fatContent"]}
                            label="Contenuto di Grassi (%)"
                            style={{ width: 200 }}
                          >
                            <InputNumber
                              min={0}
                              max={100}
                              placeholder="Inserisci il contenuto di grassi"
                              style={{ width: "100%" }}
                            />
                          </Form.Item>

                          <Form.Item
                            {...field}
                            name={[field.name, "flourAmount"]}
                            fieldKey={[field.fieldKey, "flourAmount"]}
                            label="Quantità di Farina (g)"
                            style={{ width: 200 }}
                            rules={[
                              {
                                required: true,
                                message: "Inserisci la quantità di farina!",
                              },
                            ]}
                          >
                            <InputNumber
                              min={0}
                              placeholder="Inserisci la quantità di farina"
                              style={{ width: "100%" }}
                            />
                          </Form.Item>

                          <DeleteOutlined onClick={() => remove(field.name)} />
                        </Space>
                      </div>
                    ))}

                    <Form.Item>
                      <Button
                        type="dashed"
                        onClick={() => add()}
                        block
                        icon={<PlusOutlined />}
                      >
                        Aggiungi Farina
                      </Button>
                    </Form.Item>
                  </>
                )}
              </Form.List>

              <Form.Item
                name="temperature"
                label="Temperatura dell'Ambiente (°C)"
                rules={[
                  { required: true, message: "Inserisci la temperatura!" },
                ]}
              >
                <InputNumber
                  min={-10}
                  max={50}
                  placeholder="Inserisci la temperatura dell'ambiente"
                  style={{ width: "100%" }}
                />
              </Form.Item>

              <Form.Item>
                <Button type="primary" htmlType="submit">
                  Calcola
                </Button>
              </Form.Item>
            </Form>
          </div>
        </div>
      </Content>
      <Footer style={{ textAlign: "center" }}>
        Calcolatore per Impasti - Macco di Favole 2024
      </Footer>

      <Modal
        title="Risultati"
        open={modalVisible}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
        style={{ gap: 20 }}
        okText="Nuovo calcolo"
        cancelText="Torna al calcolo"
      >
        {results ? (
          <div className="results-box">
            <Alert
              message={`Totale Polveri: ${results.totalFlourAmount} g`}
              type="info"
              showIcon
            />
            <Alert message={`W: ${results.wRating}`} type="info" showIcon />
            <Alert
              message={`Acqua: ${results.totalWater} g`}
              type="info"
              showIcon
            />
            <Alert
              message={`Sale: ${results.totalSalt} g`}
              type="info"
              showIcon
            />
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
            <Alert
              message={`Rapporto di Proteine: ${results.proteinRatio} %`}
              type="info"
              showIcon
            />
            <Alert
              message={`Rapporto di Fibre: ${results.fiberRatio} %`}
              type="info"
              showIcon
            />
            <Alert
              message={`Rapporto di Grassi: ${results.fatRatio} %`}
              type="info"
              showIcon
            />
            <Alert
              message={`Indice Glicemico: ${results.glycemicIndex}`}
              type="info"
              showIcon
            />
          </div>
        ) : (
          <Alert message="Errore nel calcolo dei risultati" type="error" />
        )}
      </Modal>
    </Layout>
  )
}

export default App
