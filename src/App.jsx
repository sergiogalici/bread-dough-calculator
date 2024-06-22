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
import { calculateDough } from "./utils/results"

const { Header, Content, Footer } = Layout
const { Title } = Typography
const { Option } = Select

const App = () => {
  const [results, setResults] = useState(null)
  const [form] = Form.useForm()
  const [modalVisible, setModalVisible] = useState(false)
  const [selectedFlourKind, setSelectedFlourKind] = useState(undefined)

  console.log("selected flour kind:", selectedFlourKind)
  console.log("is flour corn = ", selectedFlourKind === "farina di mais")

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
          🥖Calcolatore per Impasti 🍞
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
              onFinish={(values) => {
                calculateDough(values, setResults, setModalVisible)
              }}
              initialValues={{
                flours: [
                  {
                    flourKind: undefined,
                    flourAmount: 0,
                    proteinContent: 0,
                    fiberContent: 0,
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
                              onChange={(value) => {
                                setSelectedFlourKind(value)
                                form.setFieldsValue({
                                  [`flours[${index}].proteinContent`]:
                                    undefined,
                                })
                              }}
                            >
                              <Option value="grano duro">Grano Duro</Option>
                              <Option value="grano tenero">Grano Tenero</Option>
                              <Option value="farina di mais">
                                Farina di Mais
                              </Option>
                              <Option value="farina di farro">
                                Farina di Farro
                              </Option>
                              <Option value="farina di segale">
                                Farina di Segale
                              </Option>
                            </Select>
                          </Form.Item>

                          <Form.Item
                            {...field}
                            name={[field.name, "proteinContent"]}
                            fieldKey={[field.fieldKey, "proteinContent"]}
                            label="Contenuto di Proteine (%)"
                            style={{ width: 200 }}
                            disabled={selectedFlourKind === "farina di mais"}
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
              message={`Rapporto di Proteine (Glutine): ${results.proteinRatio} %`}
              type="info"
              showIcon
            />
            <Alert
              message={`Rapporto di Fibre: ${results.fiberRatio} %`}
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
