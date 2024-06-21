import React, { useState } from "react"
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

  const handleGrainChange = (index, value) => {
    const currentFlours = form.getFieldValue("flours")
    currentFlours[index].flourType = undefined
    form.setFieldsValue({ flours: currentFlours })
  }

  const calculateDough = (values) => {
    const { flours, temperature } = values
    let totalFlourAmount = 0
    let totalWater = 0
    let totalSalt = 0
    let totalYeast = 0
    let totalProtein = 0
    let waterRatio = 1

    flours.forEach((flour) => {
      const { flourAmount, proteinContent, flourType, flourKind } = flour
      totalFlourAmount += flourAmount

      if (flourKind === "grano duro") {
        if (flourType === "integrale") {
          waterRatio = 1.02 // Aggiungi 2% di acqua per la farina integrale di grano duro
        } else if (flourType === "tipo 2") {
          waterRatio = 1 // Imposta waterRatio per il tipo 2 di grano duro
        } else if (flourType === "tipo 1") {
          waterRatio = 0.95 // Imposta waterRatio per il tipo 1 di grano duro
        } else if (flourType === "0") {
          waterRatio = 0.93 // Imposta waterRatio per il tipo 0 di grano duro
        } else if (flourType === "00") {
          waterRatio = 0.91 // Imposta waterRatio per il tipo 00 di grano duro
        }
      } else if (flourKind === "grano tenero") {
        if (flourType === "integrale") {
          waterRatio = 1.05 // Aggiungi 5% di acqua per la farina integrale di grano tenero
        } else if (flourType === "tipo 2") {
          waterRatio = 1.02 // Imposta waterRatio per il tipo 2 di grano tenero
        } else if (flourType === "tipo 1") {
          waterRatio = 0.98 // Imposta waterRatio per il tipo 1 di grano tenero
        } else if (flourType === "0") {
          waterRatio = 0.96 // Imposta waterRatio per il tipo 0 di grano tenero
        } else if (flourType === "00") {
          waterRatio = 0.95 // Imposta waterRatio per il tipo 00 di grano tenero
        }
      }

      totalProtein += flourAmount * (proteinContent / 100)
      totalSalt += flourAmount * 0.02

      let baseYeast = flourAmount * 0.2 // Base 20% della quantità di farina

      // Regola la quantità di lievito in base alla temperatura
      if (temperature < 10) {
        baseYeast *= 1.2 // Aumento del 20% per temperature molto basse
      } else if (temperature < 20) {
        baseYeast *= 1 + (20 - temperature) / 50 // Aumento gradualmente con temperature sotto i 20°C
      } else if (temperature < 30) {
        baseYeast *= 1 - (temperature - 20) / 20 // Decremento gradualmente con temperature sopra i 20°C
      } else {
        baseYeast *= 0.5 // Riduzione del 50% per temperature molto alte
      }

      // Assicurati che la quantità di lievito non sia mai inferiore a 0
      baseYeast = Math.max(baseYeast, 0)

      totalYeast += baseYeast
    })

    // Calcola il tempo di lievitazione in base alla temperatura
    let riseTime
    if (temperature < 10) {
      riseTime = "36 ore"
    } else if (temperature < 15) {
      riseTime = "24 ore"
    } else if (temperature < 20) {
      riseTime = "18 ore"
    } else if (temperature < 25) {
      riseTime = "12 ore"
    } else if (temperature < 30) {
      riseTime = "8 ore"
    } else if (temperature < 35) {
      riseTime = "6 ore"
    } else {
      riseTime = "4 ore"
    }

    const proteinRatio =
      (totalProtein / (totalFlourAmount - totalProtein)) * 100

    let wRating = ""

    if (proteinRatio < 10) {
      totalWater = `${(totalFlourAmount * 0.55 * waterRatio).toFixed(0)} - ${(
        totalFlourAmount *
        0.6 *
        waterRatio
      ).toFixed(0)}`
      wRating = "90 - 220"
    } else if (proteinRatio >= 10 && proteinRatio < 11) {
      totalWater = `${(totalFlourAmount * 0.6 * waterRatio).toFixed(0)} - ${(
        totalFlourAmount *
        0.7 *
        waterRatio
      ).toFixed(0)}`
      wRating = "160 - 240"
    } else if (proteinRatio >= 11 && proteinRatio < 12) {
      totalWater = `${(totalFlourAmount * 0.6 * waterRatio).toFixed(0)} - ${(
        totalFlourAmount *
        0.75 *
        waterRatio
      ).toFixed(0)}`
      wRating = "220 - 260"
    } else if (proteinRatio >= 12 && proteinRatio < 13) {
      totalWater = `${(totalFlourAmount * 0.6 * waterRatio).toFixed(0)} - ${(
        totalFlourAmount *
        0.8 *
        waterRatio
      ).toFixed(0)}`
      wRating = "240 - 290"
    } else if (proteinRatio >= 13 && proteinRatio < 14) {
      totalWater = `${(totalFlourAmount * 0.65 * waterRatio).toFixed(0)} - ${(
        totalFlourAmount *
        0.8 *
        waterRatio
      ).toFixed(0)}`
      wRating = "270 - 340"
    } else if (proteinRatio >= 14 && proteinRatio < 15) {
      totalWater = `${(totalFlourAmount * 0.7 * waterRatio).toFixed(0)} - ${(
        totalFlourAmount *
        1 *
        waterRatio
      ).toFixed(0)}`
      wRating = "320 - 430"
    } else if (proteinRatio >= 15 && proteinRatio < 16) {
      totalWater = `${(totalFlourAmount * 0.8 * waterRatio).toFixed(0)} - ${
        totalFlourAmount * 1 * waterRatio > totalFlourAmount
          ? totalFlourAmount
          : totalFlourAmount * 1 * waterRatio.toFixed(0)
      }`
      wRating = "360 - 400++"
    } else if (proteinRatio >= 16) {
      totalWater = `${(totalFlourAmount * 0.8 * waterRatio).toFixed(0)} - ${
        totalFlourAmount * 1 * waterRatio > totalFlourAmount
          ? totalFlourAmount
          : totalFlourAmount * 1 * waterRatio.toFixed(0)
      }`
      wRating = "400++"
    }

    // Imposta i risultati con i valori calcolati
    setResults({
      totalFlourAmount: totalFlourAmount.toFixed(0),
      totalWater,
      totalSalt: totalSalt.toFixed(0),
      totalYeast: totalYeast > 100 ? 100 : totalYeast.toFixed(0),
      riseTime,
      wRating,
    })

    // Mostra la modale dei risultati
    setModalVisible(true)
  }

  const handleModalOk = () => {
    // Chiudi la modale e resetta i risultati
    setModalVisible(false)
    setResults(null)
    form.resetFields()
  }

  const handleModalCancel = () => {
    // Chiudi la modale e mantieni i risultati
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
                    flourType: undefined,
                    flourAmount: 0,
                    proteinContent: 0,
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
                              onChange={(value) =>
                                handleGrainChange(index, value)
                              }
                            >
                              <Option value="grano duro">Grano Duro</Option>
                              <Option value="grano tenero">Grano Tenero</Option>
                              <Option value="glutine puro">Glutine Puro</Option>
                            </Select>
                          </Form.Item>

                          <Form.Item
                            {...field}
                            name={[field.name, "flourType"]}
                            fieldKey={[field.fieldKey, "flourType"]}
                            label="Tipo di Farina"
                            rules={[
                              {
                                required: true,
                                message: "Seleziona il tipo di farina",
                              },
                            ]}
                          >
                            <Select
                              style={{ width: 200 }}
                              placeholder="Seleziona il tipo di farina"
                            >
                              {form.getFieldValue([
                                "flours",
                                index,
                                "flourKind",
                              ]) === "grano duro" ? (
                                <>
                                  <Option value="integrale">Integrale</Option>
                                  <Option value="tipo 2">Tipo 2</Option>
                                  <Option value="tipo 1">Tipo 1</Option>
                                </>
                              ) : form.getFieldValue([
                                  "flours",
                                  index,
                                  "flourKind",
                                ]) === "grano tenero" ? (
                                <>
                                  <Option value="integrale">Integrale</Option>
                                  <Option value="tipo 2">Tipo 2</Option>
                                  <Option value="tipo 1">Tipo 1</Option>
                                  <Option value="0">0</Option>
                                  <Option value="00">00</Option>
                                </>
                              ) : (
                                <Option value="integrale">Glutine Puro</Option>
                              )}
                            </Select>
                          </Form.Item>

                          <Form.Item
                            {...field}
                            name={[field.name, "proteinContent"]}
                            fieldKey={[field.fieldKey, "proteinContent"]}
                            label="Contenuto di Proteine (%)"
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
                            name={[field.name, "flourAmount"]}
                            fieldKey={[field.fieldKey, "flourAmount"]}
                            label="Quantità di Farina (g)"
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

          <Modal
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
              </div>
            )}
          </Modal>
        </div>
      </Content>
      <Footer style={{ textAlign: "center" }}>
        Calcolatore per Impasti - Macco di Favole 2024
      </Footer>
    </Layout>
  )
}

export default App
